import { ethers } from 'ethers';

export interface Network {
  id: string;
  name: string;
  symbol: string;
  apiUrl: string;
  explorerUrl: string;
}

export const NETWORKS: Network[] = [
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    apiUrl: 'https://eth.blockscout.com/api/v2',
    explorerUrl: 'https://etherscan.io'
  },
  {
    id: 'polygon',
    name: 'Polygon',
    symbol: 'MATIC',
    apiUrl: 'https://polygon.blockscout.com/api/v2',
    explorerUrl: 'https://polygonscan.com'
  },
  {
    id: 'optimism',
    name: 'Optimism',
    symbol: 'ETH',
    apiUrl: 'https://optimism.blockscout.com/api/v2',
    explorerUrl: 'https://optimistic.etherscan.io'
  },
  {
    id: 'base',
    name: 'Base',
    symbol: 'ETH',
    apiUrl: 'https://base.blockscout.com/api/v2',
    explorerUrl: 'https://basescan.org'
  },
  {
    id: 'zksync',
    name: 'zkSync Era',
    symbol: 'ETH',
    apiUrl: 'https://zksync.blockscout.com/api/v2',
    explorerUrl: 'https://explorer.zksync.io'
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum One',
    symbol: 'ETH',
    apiUrl: 'https://arbitrum.blockscout.com/api/v2',
    explorerUrl: 'https://arbiscan.io'
  },
  {
    id: 'gnosis',
    name: 'Gnosis Chain',
    symbol: 'xDAI',
    apiUrl: 'https://gnosis.blockscout.com/api/v2',
    explorerUrl: 'https://gnosisscan.io'
  },
  {
    id: 'scroll',
    name: 'Scroll',
    symbol: 'ETH',
    apiUrl: 'https://scroll.blockscout.com/api/v2',
    explorerUrl: 'https://scrollscan.com'
  }
];

export interface TokenBalance {
  token: {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    type: string;
  };
  value: string;
  networkId: string;
}

export async function getNetworkBalances(network: Network, address: string): Promise<TokenBalance[]> {
  if (!address || !ethers.isAddress(address)) {
    return [];
  }

  try {
    const response = await fetch(`${network.apiUrl}/addresses/${address}/token-balances`);
    if (!response.ok) {
      return [];
    }
    const data = await response.json();
    
    if (!data.items || !Array.isArray(data.items)) {
      return [];
    }

    const balances = data.items
      .filter((balance: any) => balance && balance.value && parseFloat(balance.value) > 0)
      .map((balance: any) => ({
        token: {
          address: balance.token?.address || 'native',
          name: balance.token?.name || network.name,
          symbol: balance.token?.symbol || network.symbol,
          decimals: parseInt(balance.token?.decimals || '18'),
          type: balance.token?.type || 'native'
        },
        value: formatTokenValue(balance.value, balance.token?.decimals || '18'),
        networkId: network.id
      }));

    return balances;
  } catch (error) {
    console.log(`No balances found for ${network.name}`);
    return [];
  }
}

function formatTokenValue(value: string, decimals: number | string): string {
  try {
    const decimalPlaces = Number(decimals);
    if (isNaN(decimalPlaces)) return '0';
    
    const formatted = ethers.formatUnits(value, decimalPlaces);
    return formatted;
  } catch (error) {
    return '0';
  }
}

export interface NFT {
  tokenId: string;
  name: string;
  description: string;
  imageUrl: string;
  collection: {
    name: string;
    address: string;
  };
  network: string;
}

export async function getNFTs(network: Network, address: string): Promise<NFT[]> {
  if (!address || !ethers.isAddress(address)) {
    return [];
  }

  try {
    const response = await fetch(`${network.apiUrl}/addresses/${address}/nft-tokens`);
    if (!response.ok) {
      return [];
    }
    const data = await response.json();
    
    if (!data.items || !Array.isArray(data.items)) {
      return [];
    }

    return data.items
      .filter((nft: any) => nft && nft.token_id)
      .map((nft: any) => ({
        tokenId: nft.token_id,
        name: nft.name || `#${nft.token_id}`,
        description: nft.description || '',
        imageUrl: nft.image_url || '',
        collection: {
          name: nft.collection?.name || 'Unknown Collection',
          address: nft.token_address
        },
        network: network.name
      }));
  } catch (error) {
    console.log(`No NFTs found for ${network.name}`);
    return [];
  }
}

export async function checkNetworkActivity(network: Network, address: string): Promise<boolean> {
  if (!address || !ethers.isAddress(address)) {
    return false;
  }

  try {
    const response = await fetch(
      `${network.apiUrl}/addresses/${address}/transactions?filter=to%7Cfrom&page=1&offset=1`
    );
    if (!response.ok) {
      return false;
    }
    const data = await response.json();
    return data.items && data.items.length > 0;
  } catch (error) {
    return false;
  }
}

export async function checkAllNetworksActivity(address: string): Promise<string[]> {
  if (!address || !ethers.isAddress(address)) {
    return [];
  }

  const activeNetworks = await Promise.all(
    NETWORKS.map(async (network) => {
      const hasActivity = await checkNetworkActivity(network, address);
      return hasActivity ? network.id : null;
    })
  );
  return activeNetworks.filter((id): id is string => id !== null);
}

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

export async function getWalletTransactions(
  network: Network,
  address: string,
  page = 1,
  pageSize = 10
): Promise<{ transactions: Transaction[], totalCount: number }> {
  if (!address || !ethers.isAddress(address)) {
    return { transactions: [], totalCount: 0 };
  }

  try {
    const response = await fetch(
      `${network.apiUrl}/addresses/${address}/transactions?filter=to%7Cfrom&page=${page}&offset=${pageSize}`
    );
    
    if (!response.ok) {
      return { transactions: [], totalCount: 0 };
    }

    const data = await response.json();
    
    if (!data.items || !Array.isArray(data.items)) {
      return { transactions: [], totalCount: 0 };
    }

    const transactions = data.items.map((tx: any) => ({
      hash: tx.hash,
      from: tx.from?.hash || '',
      to: tx.to?.hash || 'Contract Creation',
      value: ethers.formatEther(tx.value || '0'),
      timestamp: tx.timestamp,
      blockNumber: parseInt(tx.block_number || '0'),
      gasUsed: tx.gas_used || '0',
      status: tx.status === 'ok',
      method: tx.method || '',
      tokenTransfers: tx.token_transfers?.map((transfer: any) => ({
        token: {
          address: transfer.token?.address || '',
          symbol: transfer.token?.symbol || '',
          name: transfer.token?.name || '',
          decimals: parseInt(transfer.token?.decimals || '18')
        },
        from: transfer.from?.hash || '',
        to: transfer.to?.hash || '',
        value: formatTokenValue(transfer.total?.value || '0', transfer.token?.decimals || '18')
      })) || [],
      explorerUrl: `${network.explorerUrl}/tx/${tx.hash}`
    }));

    return {
      transactions,
      totalCount: data.total_count || transactions.length
    };
  } catch (error) {
    console.log(`Error fetching transactions for ${network.name}:`, error);
    return { transactions: [], totalCount: 0 };
  }
}