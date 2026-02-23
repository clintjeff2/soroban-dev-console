import { xdr, nativeToScVal } from '@stellar/stellar-sdk';

export type ArgType =
  | 'symbol'
  | 'address'
  | 'i32'
  | 'u32'
  | 'i128'
  | 'u128'
  | 'string'
  | 'bool'
  | 'vec'
  | 'map';

export interface ContractArg {
  id: string;
  name?: string;
  type: ArgType;
  value: any;
}

export function convertToScVal(type: ArgType, value: any): xdr.ScVal {
  switch (type) {
    case 'bool':
      return xdr.ScVal.scvBool(value === 'true' || value === true);
    case 'vec': {
      const array = typeof value === 'string' ? JSON.parse(value) : value;
      return xdr.ScVal.scvVec(array.map((item: any) => nativeToScVal(item)));
    }
    case 'map': {
      const obj = typeof value === 'string' ? JSON.parse(value) : value;
      return nativeToScVal(obj);
    }
    default:
      return nativeToScVal(value, { type: type as any });
  }
}
