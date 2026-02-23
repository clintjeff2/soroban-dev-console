"use client";

import { useEffect, useState } from "react";
import { Horizon } from "@stellar/stellar-sdk";
import { useWallet } from "@/store/useWallet";
import { useNetworkStore } from "@/store/useNetworkStore";
import {
  Activity,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Clock,
  ArrowRightLeft,
  Box,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@devconsole/ui";
import { Button } from "@devconsole/ui";
import { ScrollArea } from "@devconsole/ui";
import { Badge } from "@devconsole/ui";

const getHorizonUrl = (networkId: string) => {
  switch (networkId) {
    case "mainnet":
      return "https://horizon.stellar.org";
    case "testnet":
      return "https://horizon-testnet.stellar.org";
    case "futurenet":
      return "https://horizon-futurenet.stellar.org";
    case "local":
      return "http://localhost:8000";
    default:
      return "https://horizon-testnet.stellar.org";
  }
};

interface TxRecord {
  id: string;
  hash: string;
  successful: boolean;
  created_at: string;
  operation_count: number;
  memo?: string;
}

export function TransactionFeed() {
  const { address, isConnected } = useWallet();
  const { currentNetwork } = useNetworkStore();

  const [transactions, setTransactions] = useState<TxRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isAccountMissing, setIsAccountMissing] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    async function fetchTransactions() {
      if (!address || !isConnected) return;

      try {
        const serverUrl = getHorizonUrl(currentNetwork);
        const server = new Horizon.Server(serverUrl);

        const response = await server
          .transactions()
          .forAccount(address)
          .limit(15)
          .order("desc")
          .call();

        if (isMounted) {
          setTransactions(
            response.records.map((rec) => ({
              id: rec.id,
              hash: rec.hash,
              successful: rec.successful,
              created_at: rec.created_at,
              operation_count: rec.operation_count,
              memo: rec.memo,
            })),
          );
          setLastUpdated(new Date());
          setIsAccountMissing(false);
          timeoutId = setTimeout(fetchTransactions, 5000);
        }
      } catch (error: any) {
        if (error.response && error.response.status === 404) {
          if (isMounted) {
            setIsAccountMissing(true);
            setTransactions([]);
            timeoutId = setTimeout(fetchTransactions, 10000);
          }
        } else {
          console.error("Failed to fetch transactions:", error);
          if (isMounted) {
            timeoutId = setTimeout(fetchTransactions, 5000);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    setLoading(true);
    setIsAccountMissing(false);
    fetchTransactions();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [address, isConnected, currentNetwork]);

  const formatTime = (dateStr: string) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date(dateStr));
  };

  if (!isConnected) {
    return (
      <Card className="h-full border-dashed">
        <CardContent className="flex h-[300px] flex-col items-center justify-center gap-2 text-muted-foreground">
          <Activity className="h-8 w-8 opacity-50" />
          <p>Connect wallet to view transactions</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex h-full w-full flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-4 w-4 text-blue-500" />
              Live Activity
            </CardTitle>
            <CardDescription className="text-xs">
              Auto-updating • {currentNetwork}
            </CardDescription>
          </div>
          {lastUpdated && !isAccountMissing && (
            <Badge
              variant="outline"
              className="font-mono text-[10px] opacity-70"
            >
              Updated {lastUpdated.toLocaleTimeString()}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-[400px]">
          <div className="flex flex-col divide-y">
            {isAccountMissing ? (
              <div className="flex flex-col items-center justify-center gap-3 p-8 text-center text-sm text-muted-foreground">
                <AlertCircle className="h-8 w-8 text-orange-400 opacity-50" />
                <div>
                  <p className="font-semibold text-foreground">
                    Account Not Found
                  </p>
                  <p className="mt-1">
                    This wallet has not been funded on {currentNetwork} yet. Use
                    the Friendbot button on the dashboard to get started.
                  </p>
                </div>
              </div>
            ) : transactions.length === 0 && !loading ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No recent transactions found on this network.
              </div>
            ) : (
              transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center gap-3 p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="shrink-0">
                    {tx.successful ? (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/15">
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/15">
                        <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="truncate text-sm font-medium">
                        Transaction
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {tx.hash.slice(0, 4)}...{tx.hash.slice(-4)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(tx.created_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Box className="h-3 w-3" />
                        {tx.operation_count} Ops
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className="h-8 w-8 text-muted-foreground"
                  >
                    <a
                      href={`https://stellar.expert/explorer/${currentNetwork}/tx/${tx.hash}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
