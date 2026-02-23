"use client";

import { useSavedCallsStore, SavedCall } from "@/store/useSavedCallsStore";
import { Button } from "@devconsole/ui";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@devconsole/ui";
import { ScrollArea } from "@devconsole/ui";
import { Bookmark, Trash2, PlayCircle } from "lucide-react";
import { Badge } from "@devconsole/ui";

interface SavedCallsSheetProps {
  contractId: string;
  onSelect: (call: SavedCall) => void;
}

export function SavedCallsSheet({
  contractId,
  onSelect,
}: SavedCallsSheetProps) {
  const { savedCalls, removeCall } = useSavedCallsStore();

  const relevantCalls = savedCalls.filter((c) => c.contractId === contractId);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Bookmark className="h-4 w-4" />
          Saved Calls
          <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] px-1">
            {relevantCalls.length}
          </Badge>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Saved Interactions</SheetTitle>
          <SheetDescription>
            Quickly load previously saved function calls for this contract.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="mt-6 h-[calc(100vh-120px)] pr-4">
          <div className="space-y-4">
            {relevantCalls.length === 0 ? (
              <div className="rounded-md border border-dashed py-8 text-center text-sm text-muted-foreground">
                No saved calls yet.
                <br />
                Click "Save" on the form to add one.
              </div>
            ) : (
              relevantCalls.map((call) => (
                <div
                  key={call.id}
                  className="group relative rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="mb-2 flex items-start justify-between">
                    <h4 className="truncate pr-6 text-sm font-semibold">
                      {call.name}
                    </h4>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-3 top-3 h-6 w-6 text-muted-foreground opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeCall(call.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="mb-3 space-y-1 font-mono text-xs text-muted-foreground">
                    <div className="flex gap-2">
                      <span className="text-blue-500">fn:</span>
                      {call.fnName}
                    </div>
                    <div className="flex gap-2">
                      <span className="text-blue-500">args:</span>
                      {call.args.length}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    className="w-full gap-2"
                    onClick={() => onSelect(call)}
                  >
                    <PlayCircle className="h-3 w-3" />
                    Load
                  </Button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
