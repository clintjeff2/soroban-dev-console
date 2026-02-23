import { ScVal, TransactionEnvelope, xdr } from '@stellar/stellar-sdk';

export type XdrType = 'TransactionEnvelope' | 'ScVal' | 'LedgerKey';

export function encodeJsonToXdr(jsonString: string, type: XdrType): string {
  try {
    const obj = JSON.parse(jsonString);

    switch (type) {
      case 'TransactionEnvelope':
        return TransactionEnvelope.fromJSON(jsonString).toXDR();

      case 'ScVal':
        // ScVal.fromJSON expects a very specific structure
        return ScVal.fromJSON(jsonString).toXDR('base64');

      case 'LedgerKey':
        return xdr.LedgerKey.fromJSON(jsonString).toXDR('base64');

      default:
        throw new Error('Unsupported XDR type for encoding');
    }
  } catch (error: any) {
    throw new Error(`Encoding failed: ${error.message}`);
  }
}
