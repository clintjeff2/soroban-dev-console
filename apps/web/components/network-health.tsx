'use client';

import { useEffect, useState } from 'react';
import { useNetworkStore } from '@/store/useNetworkStore';
import { SorobanRpc } from '@stellar/stellar-sdk';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@devconsole/ui';
import { cn } from '@devconsole/ui';

export function NetworkHealth() {
  const { getActiveNetworkConfig, health, setHealth } = useNetworkStore();
  const config = getActiveNetworkConfig();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    async function checkHealth() {
      const server = new SorobanRpc.Server(config.rpcUrl);
      const start = Date.now();

      try {
        const latestLedger = await server.getLatestLedger();
        const latency = Date.now() - start;

        // In a real implementation, you might fetch protocol via server.getNetwork()
        // Here we simulate protocol 21 for demonstration
        setHealth({
          status: latency > 1000 ? 'degraded' : 'healthy',
          latestLedger: latestLedger.sequence,
          protocolVersion: 21,
          latencyMs: latency,
          lastCheck: Date.now(),
        });
      } catch (e) {
        setHealth({
          status: 'offline',
          latestLedger: 0,
          protocolVersion: 0,
          latencyMs: 0,
          lastCheck: Date.now(),
        });
      }
    }

    checkHealth();
    interval = setInterval(checkHealth, 30000); // Poll every 30s

    return () => clearInterval(interval);
  }, [config.rpcUrl, setHealth]);

  if (!health) return null;

  const statusColors = {
    healthy: 'bg-green-500',
    degraded: 'bg-yellow-500',
    offline: 'bg-red-500',
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-muted cursor-help transition-colors">
            <div
              className={cn(
                'h-2 w-2 rounded-full animate-pulse',
                statusColors[health.status],
              )}
            />
            <span className="text-xs font-mono text-muted-foreground hidden lg:inline">
              {health.latencyMs}ms
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs space-y-1">
          <p className="font-bold uppercase">{health.status}</p>
          <p>Ledger: {health.latestLedger}</p>
          <p>Protocol: {health.protocolVersion}</p>
          <p className="text-[10px] opacity-70">
            Last check: {new Date(health.lastCheck).toLocaleTimeString()}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
