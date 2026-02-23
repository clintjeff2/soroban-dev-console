"use client";

import { useState } from "react";
import { xdr } from "@stellar/stellar-sdk";
import { Button } from "@devconsole/ui";
import { Textarea } from "@devconsole/ui";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@devconsole/ui";
import { Label } from "@devconsole/ui";
import { AlertCircle, CheckCircle, Copy, Trash2, Code } from "lucide-react";
import { toast } from "sonner";

// Helper to handle BigInt serialization in JSON
const jsonReplacer = (_key: string, value: any) => {
  if (typeof value === "bigint") {
    return value.toString();
  }
  if (value && value.type === "Buffer" && Array.isArray(value.data)) {
    // Optional: Make Buffers readable as hex if preferred
    // return Buffer.from(value.data).toString('hex');
  }
  return value;
};

export default function XdrDecoderPage() {
  const [input, setInput] = useState("");
  const [decoded, setDecoded] = useState<string | null>(null);
  const [detectedType, setDetectedType] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDecode = () => {
    setError(null);
    setDecoded(null);
    setDetectedType(null);

    const trimmed = input.trim();
    if (!trimmed) return;

    // List of XDR types to attempt, in order of likelihood
    const attempts = [
      { name: "Transaction Envelope", method: xdr.TransactionEnvelope.fromXDR },
      { name: "Transaction Result", method: xdr.TransactionResult.fromXDR },
      { name: "Transaction Meta", method: xdr.TransactionMeta.fromXDR },
      { name: "Soroban Value (ScVal)", method: xdr.ScVal.fromXDR },
      { name: "Ledger Entry", method: xdr.LedgerEntry.fromXDR },
      { name: "Soroban Auth", method: xdr.SorobanAuthorizationEntry.fromXDR },
    ];

    let result = null;
    let typeName = "";

    for (const attempt of attempts) {
      try {
        // Try to decode as base64
        result = attempt.method(trimmed, "base64");
        typeName = attempt.name;
        break; // Stop on first success
      } catch (e) {
        // Continue to next type
      }
    }

    if (result) {
      setDetectedType(typeName);
      // Convert to JSON with indentation (handling BigInts)
      setDecoded(JSON.stringify(result, jsonReplacer, 2));
      toast.success(`Decoded as ${typeName}`);
    } else {
      setError("Could not decode XDR. Invalid format or unsupported type.");
      toast.error("Decoding failed");
    }
  };

  const copyToClipboard = () => {
    if (decoded) {
      navigator.clipboard.writeText(decoded);
      toast.success("JSON copied to clipboard");
    }
  };

  const clearAll = () => {
    setInput("");
    setDecoded(null);
    setDetectedType(null);
    setError(null);
  };

  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">XDR Decoder</h1>
        <p className="text-muted-foreground">
          Paste any base64 XDR string from Stellar/Soroban to view its
          human-readable structure.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Input Section */}
        <div className="space-y-4">
          <Card className="flex h-full flex-col">
            <CardHeader>
              <CardTitle>Input</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <div className="grid w-full gap-1.5">
                <Label htmlFor="xdr-input">Base64 XDR String</Label>
                <Textarea
                  id="xdr-input"
                  placeholder="AAAAAgAAA..."
                  className="min-h-[300px] resize-none font-mono text-xs"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleDecode}
                  disabled={!input}
                  className="flex-1 gap-2"
                >
                  <Code className="h-4 w-4" />
                  Decode
                </Button>
                <Button variant="outline" onClick={clearAll} disabled={!input}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-md bg-red-50 p-3 text-sm text-red-500 dark:bg-red-900/20">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Output Section */}
        <div className="space-y-4">
          <Card className="flex h-full flex-col border-dashed bg-muted/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle>Result</CardTitle>
                <CardDescription>
                  {detectedType ? (
                    <span className="flex items-center gap-1 font-medium text-green-600">
                      <CheckCircle className="h-3 w-3" />
                      {detectedType}
                    </span>
                  ) : (
                    "Waiting for input..."
                  )}
                </CardDescription>
              </div>
              {decoded && (
                <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="relative min-h-[300px] flex-1">
              {decoded ? (
                <div className="absolute inset-4 overflow-auto rounded-md bg-zinc-950 p-4 font-mono text-xs text-zinc-50">
                  <pre>{decoded}</pre>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-sm italic text-muted-foreground">
                  Decoded JSON will appear here
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
