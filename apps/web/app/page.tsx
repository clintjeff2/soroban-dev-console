import { ConnectWalletButton } from "@/components/wallet-connect";
import { Button } from "@devconsole/ui";
import { TransactionFeed } from "@/components/transaction-feed";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@devconsole/ui";
import { Wallet, ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Top Hero / Welcome Section */}
      <div className="border-b bg-muted/40">
        <div className="container mx-auto p-6 py-10">
          <div className="flex flex-col gap-4">
            <h1 className="text-4xl font-bold tracking-tight">
              Soroban DevConsole
            </h1>
            <p className="max-w-2xl text-xl text-muted-foreground">
              Your command center for building, testing, and monitoring Soroban
              smart contracts.
            </p>
            <div className="flex gap-3 pt-4">
              <div className="md:hidden">
                <ConnectWalletButton />
              </div>
              <Button variant="outline" className="gap-2" asChild>
                <Link href="/docs">
                  <BookOpen className="h-4 w-4" />
                  Documentation
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="container mx-auto grid grid-cols-1 gap-6 p-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                Account Overview
              </CardTitle>
              <CardDescription>
                Connect your wallet to view balances and asset trustlines.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex min-h-[150px] items-center justify-center border-t bg-muted/10">
              <div className="space-y-2 text-center">
                <p className="text-sm text-muted-foreground">
                  No wallet connected
                </p>
                <ConnectWalletButton />
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card className="group cursor-pointer transition-colors hover:bg-muted/50">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-lg">
                  Contract Explorer
                  <ArrowRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                </CardTitle>
                <CardDescription>
                  Interact with deployed contracts
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group cursor-pointer transition-colors hover:bg-muted/50">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-lg">
                  XDR Decoder
                  <ArrowRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                </CardTitle>
                <CardDescription>Debug raw Stellar data</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        <div className="h-full min-h-[500px] lg:col-span-1">
          <TransactionFeed />
        </div>
      </div>
    </main>
  );
}
