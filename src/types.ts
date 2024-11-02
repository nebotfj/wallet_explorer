export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: string;
  blockNumber: number;
  gasUsed: string;
  status: boolean;
  method?: string;
  tokenTransfers?: TokenTransfer[];
  internalTransactions?: InternalTransaction[];
  explorerUrl: string;
}

export interface TokenTransfer {
  token: {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
  };
  from: string;
  to: string;
  value: string;
}

export interface InternalTransaction {
  from: string;
  to: string;
  value: string;
  type: string;
}

export interface NFT {
  address: string;
  name: string;
  symbol: string;
  type: string;
  totalSupply: string;
  holders: number;
  explorerUrl: string;
}

export interface CSVRow {
  hash: string;
  network: string;
  method: string;
  from: string;
  to: string;
  value: string;
  tokenTransfers: string;
  status: string;
  gasUsed: string;
  blockNumber: number;
  timestamp: string;
  explorerUrl: string;
}