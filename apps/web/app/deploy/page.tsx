"use client";

import { useState } from "react";
import { useWallet } from "@/store/useWallet";
import { useNetworkStore } from "@/store/useNetworkStore";
import { useContractStore } from "@/store/useContractStore";
import {
  rpc as SorobanRpc,
  TransactionBuilder,
  TimeoutInfinite,
  hash,
  Address,
  Operation,
} from "@stellar/stellar-sdk";
import { signTransaction } from "@stellar/freighter-api";
import {
  UploadCloud,
  FileCode,
  Loader2,
  CheckCircle,
  Copy,
} from "lucide-react";
import { Button } from "@devconsole/ui";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@devconsole/ui";
import { Input } from "@devconsole/ui";
import { Label } from "@devconsole/ui";
import { toast } from "sonner";

export default function DeployPage() {
  const { isConnected, address } = useWallet();
  const { getActiveNetworkConfig } = useNetworkStore();
  const { addContract } = useContractStore();

  const [file, setFile] = useState<File | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedId, setDeployedId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (!selected.name.endsWith(".wasm")) {
        toast.error("Please upload a .wasm file");
        return;
      }
      setFile(selected);
    }
  };

  const deployContract = async () => {
    if (!file || !address || !isConnected) return;

    setIsDeploying(true);
    setDeployedId(null);
    setStatus("Reading WASM file...");

    try {
      const network = getActiveNetworkConfig();
      const server = new SorobanRpc.Server(network.rpcUrl);
      const arrayBuffer = await file.arrayBuffer();
      const wasmBuffer = Buffer.from(arrayBuffer);

      setStatus("Uploading WASM to network...");
      const sourceAccount = await server.getAccount(address);

      const installOp = Operation.uploadContractWasm({
        wasm: wasmBuffer,
      });

      const tx = new TransactionBuilder(sourceAccount, {
        fee: "10000",
        networkPassphrase: network.networkPassphrase,
      })
        .addOperation(installOp)
        .setTimeout(TimeoutInfinite)
        .build();

      const preparedTx = await server.prepareTransaction(tx);
      const signedXdr = await signTransaction(preparedTx.toXDR(), {
        networkPassphrase: network.networkPassphrase,
      });

      setStatus("Submitting WASM...");
      const sendRes = await server.sendTransaction(
        TransactionBuilder.fromXDR(
          signedXdr.signedTxXdr,
          network.networkPassphrase,
        ),
      );

      if (sendRes.status !== "PENDING")
        throw new Error(`WASM upload failed: ${sendRes.status}`);

      setStatus("Waiting for WASM confirmation...");
      let wasmHash = "";

      const getTxStatus = async (hash: string) => {
        const res = await server.getTransaction(hash);
        if (res.status === SorobanRpc.Api.GetTransactionStatus.SUCCESS) {
          return res;
        }
        return null;
      };

      let attempts = 0;
      while (attempts < 10) {
        await new Promise((r) => setTimeout(r, 2000));
        const res = await getTxStatus(sendRes.hash);
        if (res) {
          wasmHash = hash(wasmBuffer).toString("hex");
          break;
        }
        attempts++;
      }

      if (!wasmHash) {
        wasmHash = hash(wasmBuffer).toString("hex");
      }

      setStatus("Instantiating Contract...");

      const sourceAccount2 = await server.getAccount(address);

      const createOp = Operation.createCustomContract({
        wasmHash: Buffer.from(wasmHash, "hex"),
        address: Address.fromString(address),
        salt: Buffer.alloc(32).fill(0),
      });

      const createTx = new TransactionBuilder(sourceAccount2, {
        fee: "10000",
        networkPassphrase: network.networkPassphrase,
      })
        .addOperation(createOp)
        .setTimeout(TimeoutInfinite)
        .build();

      const preparedCreate = await server.prepareTransaction(createTx);
      const signedCreate = await signTransaction(preparedCreate.toXDR(), {
        networkPassphrase: network.networkPassphrase,
      });

      const createRes = await server.sendTransaction(
        TransactionBuilder.fromXDR(
          signedCreate.signedTxXdr,
          network.networkPassphrase,
        ),
      );

      if (createRes.status !== "PENDING")
        throw new Error("Instantiation failed");

      setStatus("Finalizing deployment...");

      attempts = 0;
      while (attempts < 10) {
        await new Promise((r) => setTimeout(r, 2000));
        const res = await server.getTransaction(createRes.hash);
        if (res.status === SorobanRpc.Api.GetTransactionStatus.SUCCESS) {
          // We need to parse the result meta to get the ID, but for now,
          // let's assume we can fetch it or the user can calculate it.
          // *Optimization:* The easiest way to get the ID *before* sending is using `Address.contractId(...)`
          // But let's just use the `returnValue` if available or display success.

          // For MVP, we calculate deterministic ID if we used a known salt:
          const contractId = (new Address(address) as any)
            .contractId(Buffer.alloc(32).fill(0), network.networkPassphrase)
            .toString();

          setDeployedId(contractId);
          addContract(contractId, network.id); // Auto-add to watchlist
          toast.success("Contract Deployed Successfully!");
          break;
        }
        attempts++;
      }
    } catch (e: any) {
      console.error(e);
      toast.error(`Deployment Failed: ${e.message}`);
    } finally {
      setIsDeploying(false);
      setStatus("");
    }
  };

  return (
    <div className="container max-w-2xl p-6">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">
        Deploy Contract
      </h1>

      {!isConnected ? (
        <Card className="border-dashed">
          <CardContent className="flex h-40 flex-col items-center justify-center">
            <p className="text-muted-foreground">
              Connect wallet to deploy contracts
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Upload WASM</CardTitle>
            <CardDescription>
              Upload your compiled Soroban smart contract (.wasm)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="wasm">Contract File</Label>
              <Input
                id="wasm"
                type="file"
                accept=".wasm"
                onChange={handleFileChange}
              />
            </div>

            {file && (
              <div className="flex items-center gap-2 rounded-md bg-muted p-3">
                <FileCode className="h-5 w-5 text-blue-500" />
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
            )}

            {isDeploying && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {status}
                </div>
              </div>
            )}

            {deployedId ? (
              <div className="rounded-md border border-green-200 bg-green-50 p-4 dark:bg-green-900/20">
                <div className="mb-2 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div className="font-semibold text-green-700 dark:text-green-400">
                    Deployment Complete!
                  </div>
                </div>
                <p className="mb-2 text-sm text-muted-foreground">
                  Contract ID:
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 break-all rounded border bg-background px-2 py-1 font-mono text-xs">
                    {deployedId}
                  </code>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => navigator.clipboard.writeText(deployedId)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                className="w-full"
                onClick={deployContract}
                disabled={!file || isDeploying}
              >
                {isDeploying ? "Deploying..." : "Deploy Contract"}
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
