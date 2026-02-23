"use client";

import { Command } from "cmdk";
import {
  Briefcase,
  FileCode,
  Globe,
  Search,
  Terminal,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import { useNetworkStore } from "@/store/useNetworkStore";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();

  const { workspaces, setActiveWorkspace } = useWorkspaceStore();
  const { currentNetwork, setNetwork } = useNetworkStore();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    setSearch("");
    command();
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Global Command Menu"
      className="bg-background/80 fixed inset-0 z-50 flex items-start justify-center pt-[20vh] backdrop-blur-sm"
    >
      <div className="bg-popover animate-in fade-in zoom-in-95 w-full max-w-xl overflow-hidden rounded-xl border shadow-2xl">
        <div className="flex items-center border-b px-3">
          <Search className="text-muted-foreground mr-2 h-4 w-4" />
          <Command.Input
            value={search} // Controlled input
            onValueChange={setSearch}
            placeholder="Type a command or search..."
            className="h-12 w-full bg-transparent text-sm outline-none"
          />
        </div>

        <Command.List className="scrollbar-thin max-h-[300px] overflow-y-auto p-2">
          <Command.Empty className="text-muted-foreground p-4 text-center text-sm">
            No results found.
          </Command.Empty>

          <Command.Group
            heading="Navigation"
            className="text-muted-foreground px-2 py-1 text-[10px] font-bold uppercase"
          >
            <Command.Item
              value="wasm registry upload code"
              onSelect={() => runCommand(() => router.push("/deploy/wasm"))}
              className="aria-selected:bg-accent flex cursor-pointer items-center rounded-md px-2 py-2 text-sm"
            >
              <FileCode className="mr-2 h-4 w-4" /> WASM Registry
            </Command.Item>
            <Command.Item
              value="xdr transformer decoder encoder"
              onSelect={() => runCommand(() => router.push("/tools/xdr"))}
              className="aria-selected:bg-accent flex cursor-pointer items-center rounded-md px-2 py-2 text-sm"
            >
              <Zap className="mr-2 h-4 w-4" /> XDR Transformer
            </Command.Item>
          </Command.Group>

          <Command.Group
            heading="Switch Workspace"
            className="text-muted-foreground mt-2 px-2 py-1 text-[10px] font-bold uppercase"
          >
            {workspaces.map((w) => (
              <Command.Item
                key={w.id}
                value={`workspace ${w.name}`}
                onSelect={() =>
                  runCommand(() => {
                    setActiveWorkspace(w.id);
                    toast.success(`Workspace switched to: ${w.name}`);
                  })
                }
                className="aria-selected:bg-accent flex cursor-pointer items-center rounded-md px-2 py-2 text-sm"
              >
                <Briefcase className="mr-2 h-4 w-4" /> {w.name}
              </Command.Item>
            ))}
          </Command.Group>

          <Command.Group
            heading="Networks"
            className="text-muted-foreground mt-2 px-2 py-1 text-[10px] font-bold uppercase"
          >
            {["testnet", "mainnet", "futurenet"].map((net) => (
              <Command.Item
                key={net}
                value={`network switch to ${net}`}
                onSelect={() =>
                  runCommand(() => {
                    setNetwork(net);
                    toast.success(`Network switched to ${net.toUpperCase()}`);
                  })
                }
                className="aria-selected:bg-accent flex cursor-pointer items-center rounded-md px-2 py-2 text-sm"
              >
                <Globe className="mr-2 h-4 w-4" /> Switch to {net}
              </Command.Item>
            ))}
          </Command.Group>
        </Command.List>

        <div className="bg-muted/30 text-muted-foreground flex items-center justify-between border-t p-2 text-[10px]">
          <span>Tip: Use arrows to navigate</span>
          <div className="flex gap-1">
            <kbd className="bg-background rounded border px-1">esc</kbd>
            <span>to close</span>
          </div>
        </div>
      </div>
    </Command.Dialog>
  );
}