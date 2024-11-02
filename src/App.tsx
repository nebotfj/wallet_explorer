import React, { useState, useEffect } from 'react';
import { Wallet } from 'lucide-react';
import { getWalletTransactions, NETWORKS, checkAllNetworksActivity, getNetworkBalances, getNFTs, type TokenBalance } from './api';
import { TransactionList } from './components/TransactionList';
import { Pagination } from './components/Pagination';
import NetworkBalances from './components/NetworkBalances';
import NFTList from './components/NFTList';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

function App() {
  const [address, setAddress] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState(NETWORKS[0]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [activeNetworks, setActiveNetworks] = useState<string[]>([]);
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [nfts, setNfts] = useState<any[]>([]);

  useEffect(() => {
    if (address) {
      checkActivity();
      fetchBalances();
      fetchNFTs();
    }
  }, [address]);

  const checkActivity = async () => {
    if (!address) return;
    const active = await checkAllNetworksActivity(address);
    setActiveNetworks(active);
    if (active.length > 0) {
      setSelectedNetwork(NETWORKS.find(n => n.id === active[0]) || NETWORKS[0]);
    }
  };

  const fetchBalances = async () => {
    if (!address) return;
    setIsLoadingBalances(true);
    
    try {
      const balancePromises = NETWORKS.map(network => 
        getNetworkBalances(network, address)
      );

      const networkBalances = await Promise.all(balancePromises);
      const allBalances = networkBalances.flat().filter(balance => 
        balance && parseFloat(balance.value) > 0
      );
      
      setBalances(allBalances);
    } catch (error) {
      console.error('Error fetching balances:', error);
    } finally {
      setIsLoadingBalances(false);
    }
  };

  const fetchNFTs = async () => {
    if (!address) return;
    
    try {
      const nftPromises = NETWORKS.map(network => 
        getNFTs(network, address)
      );

      const networkNFTs = await Promise.all(nftPromises);
      const allNFTs = networkNFTs.flat().filter(nft => 
        nft && nft.imageUrl
      );
      
      setNfts(allNFTs);
    } catch (error) {
      console.error('Error fetching NFTs:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;
    setCurrentPage(1);
    await fetchTransactions(1);
  };

  const fetchTransactions = async (page: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getWalletTransactions(selectedNetwork, address, page, pageSize);
      setTransactions(result.transactions);
      setTotalCount(result.totalCount);
    } catch (err) {
      setError('Failed to fetch transactions. Please check the address and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = async (page: number) => {
    setCurrentPage(page);
    await fetchTransactions(page);
  };

  const handlePageSizeChange = async (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
    await fetchTransactions(1);
  };

  const handleNetworkChange = async (networkId: string) => {
    const network = NETWORKS.find(n => n.id === networkId);
    if (network) {
      setSelectedNetwork(network);
      setCurrentPage(1);
      await fetchTransactions(1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <Wallet className="mx-auto h-12 w-12 text-blue-500" />
          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            Multi-Chain Wallet Explorer
          </h1>
          <p className="mt-2 text-gray-600">
            Explore wallet transactions across multiple blockchain networks
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="sm:w-1/4">
              <label htmlFor="network" className="block text-sm font-medium text-gray-700 mb-1">
                Network
              </label>
              <select
                id="network"
                value={selectedNetwork.id}
                onChange={(e) => handleNetworkChange(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                {NETWORKS.filter(network => activeNetworks.includes(network.id)).map(network => (
                  <option key={network.id} value={network.id}>
                    {network.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Wallet Address
              </label>
              <input
                type="text"
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Enter wallet address (0x...)"
              />
            </div>
            <div className="sm:self-end">
              <button
                type="submit"
                disabled={isLoading || !address}
                className="w-full sm:w-auto px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Loading...' : 'Search'}
              </button>
            </div>
          </div>
        </form>

        {address && balances.length > 0 && (
          <NetworkBalances balances={balances} />
        )}

        {address && nfts.length > 0 && (
          <NFTList nfts={nfts} />
        )}

        <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">
              Transaction History
              {selectedNetwork && (
                <span className="ml-2 text-sm text-gray-500">
                  ({selectedNetwork.name})
                </span>
              )}
            </h2>
            <div className="flex items-center gap-2">
              <label htmlFor="pageSize" className="text-sm text-gray-600">
                Show:
              </label>
              <select
                id="pageSize"
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                {PAGE_SIZE_OPTIONS.map(size => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <TransactionList
            transactions={transactions}
            isLoading={isLoading}
            error={error}
            network={selectedNetwork}
            searchAddress={address}
          />
          {transactions.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(totalCount / pageSize)}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;