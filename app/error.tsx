'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AlertCircle, RefreshCcw, Copy, Home } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an external service if needed
    console.error('Application Crash:', error);
  }, [error]);

  const copyDiagnosticReport = () => {
    const report = {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    };
    navigator.clipboard.writeText(JSON.stringify(report, null, 2));
    toast.success('Diagnostic report copied to clipboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="max-w-md w-full border-destructive/50 shadow-lg">
        <CardHeader>
          <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle>Application Error</CardTitle>
          <CardDescription>
            Something went wrong while rendering this page. This might be due to
            a network timeout or an unexpected contract response.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-3 rounded-md overflow-hidden">
            <p className="text-xs font-mono break-all text-muted-foreground">
              {error.message || 'An unknown error occurred'}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <div className="flex w-full gap-2">
            <Button onClick={() => reset()} className="flex-1">
              <RefreshCcw className="mr-2 h-4 w-4" /> Try Again
            </Button>
            <Button variant="outline" onClick={copyDiagnosticReport}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="ghost" asChild className="w-full">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" /> Return Home
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
