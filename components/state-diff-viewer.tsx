'use client';

import { ArrowRight, Edit3, Minus, Plus } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { DiffResult } from '@/lib/diff-utils';

export function StateDiffViewer({ diffs }: { diffs: DiffResult[] }) {
  if (diffs.length === 0) return <p className="text-muted-foreground text-xs italic">No state changes detected.</p>;

  return (
    <div className="space-y-3">
      {diffs.map((diff, i) => (
        <div key={i} className="bg-muted/20 rounded-md border p-2 font-mono text-[10px]">
          <div className="mb-1 flex items-center gap-2">
            {diff.type === 'added' && (
              <Badge className="border-green-200 bg-green-500/10 text-green-600">
                <Plus className="mr-1 h-3 w-3" /> Added
              </Badge>
            )}
            {diff.type === 'modified' && (
              <Badge className="border-blue-200 bg-blue-500/10 text-blue-600">
                <Edit3 className="mr-1 h-3 w-3" /> Changed
              </Badge>
            )}
            {diff.type === 'deleted' && (
              <Badge className="border-red-200 bg-red-500/10 text-red-600">
                <Minus className="mr-1 h-3 w-3" /> Removed
              </Badge>
            )}
            <span className="truncate opacity-60">Key: {diff.key.substring(0, 12)}...</span>
          </div>

          <div className="grid grid-cols-[1fr,20px,1fr] items-center gap-2 overflow-x-auto p-1">
            <div className="truncate rounded bg-red-500/5 p-1 text-red-700/70">{diff.oldValue || '∅'}</div>
            <ArrowRight className="text-muted-foreground h-3 w-3" />
            <div className="truncate rounded bg-green-500/5 p-1 text-green-700">{diff.newValue || '∅'}</div>
          </div>
        </div>
      ))}
    </div>
  );
}