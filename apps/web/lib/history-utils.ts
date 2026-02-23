import { Horizon } from "@stellar/stellar-sdk";

export interface HistoryRecord {
  timestamp: string;
  hash: string;
  opType: string;
  feePaid: number;
  result: string;
}

export async function fetchAccountHistory(
  address: string,
  rpcUrl: string,
): Promise<HistoryRecord[]> {
  // Using Horizon (Standard Stellar API) for history, as Soroban RPC is for state
  const horizonUrl = rpcUrl.replace("rpc", "horizon");
  const server = new Horizon.Server(horizonUrl);

  try {
    const txs = await server
      .transactions()
      .forAccount(address)
      .limit(50)
      .order("desc")
      .call();

    return txs.records.map((r) => ({
      timestamp: r.created_at,
      hash: r.hash,
      opType: r.operation_count > 1 ? "Multi-Op" : "Contract/Payment",
      feePaid: Number(r.fee_charged),
      result: r.successful ? "Success" : "Failed",
    }));
  } catch (error) {
    console.error("History fetch failed:", error);
    return [];
  }
}
