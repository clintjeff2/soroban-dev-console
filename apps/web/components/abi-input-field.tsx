'use client';

import { ContractArg } from '@devconsole/soroban-utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface AbiInputFieldProps {
  arg: ContractArg;
  onChange: (id: string, value: string) => void;
}

export function AbiInputField({ arg, onChange }: AbiInputFieldProps) {
  const isComplex = arg.type === 'vec' || arg.type === 'map';

  return (
    <div className="space-y-1.5 flex-1">
      <div className="flex justify-between items-center">
        <Label className="text-[10px] uppercase font-bold text-muted-foreground">
          {arg.name || 'Argument'}
          <span className="ml-1 font-mono lowercase opacity-60">
            ({arg.type})
          </span>
        </Label>
      </div>

      {isComplex ? (
        <Textarea
          placeholder={
            arg.type === 'vec' ? '[item1, item2]' : '{"key": "value"}'
          }
          value={arg.value}
          onChange={(e) => onChange(arg.id, e.target.value)}
          className="font-mono text-xs min-h-[80px]"
        />
      ) : (
        <Input
          type={arg.type === 'i32' ? 'number' : 'text'}
          placeholder={`Enter ${arg.type}...`}
          value={arg.value}
          onChange={(e) => onChange(arg.id, e.target.value)}
          className="h-9"
        />
      )}
    </div>
  );
}

