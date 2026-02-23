import { Button } from "@devconsole/ui";
import Link from "next/link";
import { ArrowRight, Terminal, Zap } from "lucide-react";
import { Card, CardContent } from "@devconsole/ui";

export default function DocsIntroPage() {
  return (
    <div className="max-w-3xl space-y-8">
      <div className="space-y-4 border-b pb-8">
        <h1 className="text-4xl font-bold tracking-tight">Documentation</h1>
        <p className="text-xl text-muted-foreground">
          Welcome to the Soroban DevConsole. Learn how to build, test, and debug
          contracts visually.
        </p>
        <div className="flex gap-4 pt-4">
          <Button asChild>
            <Link href="/docs/getting-started" className="gap-2">
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link
              href="https://developers.stellar.org/docs/smart-contracts"
              target="_blank"
            >
              Stellar Official Docs
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <Zap className="mb-4 h-10 w-10 text-orange-500" />
            <h3 className="mb-2 text-lg font-semibold">Fast Interactions</h3>
            <p className="text-sm text-muted-foreground">
              Invoke contract functions using auto-generated forms. No need to
              write scripts or CLI commands for quick tests.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Terminal className="mb-4 h-10 w-10 text-blue-500" />
            <h3 className="mb-2 text-lg font-semibold">Visual Debugging</h3>
            <p className="text-sm text-muted-foreground">
              Inspect contract state, decode XDR data, and monitor transaction
              events in real-time.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
