import React, { useState } from 'react';
import { format } from 'date-fns';
import { ExternalLink, CheckCircle, XCircle, ChevronDown, ChevronUp, Search, Download } from 'lucide-react';
import type { Transaction } from '../types';
import type { Network } from '../api';
import { generateTransactionCSV, downloadCSV } from '../utils/csv';

interface TransactionListProps {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  network: Network;
  searchAddress: string;
}

function TransactionDetails({ transaction, network }: { transaction: Transaction; network: Network }) {
  return (
    <div className="px-6 py-4 bg-gray-50 space-y-4">
      {transaction.tokenTransfers && transaction.tokenTransfers.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Token Transfers</h4>
          <div className="space-y-2">
            {transaction.tokenTransfers.map((transfer, idx) => (
              <div key={idx} className="text-sm text-gray-600 bg-white p-3 rounded-md shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{transfer.token.name} ({transfer.token.symbol})</span>
                  <span>{parseFloat(transfer.value).toFixed(4)}</span>
                </div>
                <div className="text-xs mt-1">
                  From: {transfer.from.slice(0, 6)}...{transfer.from.slice(-4)} →
                  To: {transfer.to.slice(0, 6)}...{transfer.to.slice(-4)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {transaction.internalTransactions && transaction.internalTransactions.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Internal Transactions</h4>
          <div className="space-y-2">
            {transaction.internalTransactions.map((tx, idx) => (
              <div key={idx} className="text-sm text-gray-600 bg-white p-3 rounded-md shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{tx.type}</span>
                  <span>{parseFloat(tx.value).toFixed(4)} {network.symbol}</span>
                </div>
                <div className="text-xs mt-1">
                  From: {tx.from.slice(0, 6)}...{tx.from.slice(-4)} →
                  To: {tx.to.slice(0, 6)}...{tx.to.slice(-4)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function TransactionList({ transactions, isLoading, error, network, searchAddress }: TransactionListProps) {
  const [expandedTx, setExpandedTx] = useState<string | null>(null);

  const formatAddress = (address: string, isSearchAddress: boolean) => {
    const shortened = `${address.slice(0, 6)}...${address.slice(-4)}`;
    return isSearchAddress ? (
      <span className="font-bold">{shortened}</span>
    ) : (
      <span>{shortened}</span>
    );
  };

  const handleDownloadCSV = () => {
    const csvContent = generateTransactionCSV(transactions, network);
    const filename = `transactions_${network.name.toLowerCase()}_${format(new Date(), 'yyyyMMdd')}.csv`;
    downloadCSV(csvContent, filename);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-2">
          <Search className="mx-auto h-12 w-12" />
        </div>
        <p className="text-gray-500">
          No transactions found for this address on {network.name}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end px-6 py-3">
        <button
          onClick={handleDownloadCSV}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Download className="h-4 w-4 mr-2" />
          Download CSV
        </button>
      </div>
      <div className="overflow-x-auto max-h-[70vh] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hash
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Method
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                From
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                To
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                In. Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                In. Asset
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Out. Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Out. Asset
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((tx) => {
              const isFromSearchAddress = tx.from.toLowerCase() === searchAddress.toLowerCase();
              const isToSearchAddress = tx.to.toLowerCase() === searchAddress.toLowerCase();

              const incomingTokens = tx.tokenTransfers?.filter(t => 
                t.to.toLowerCase() === searchAddress.toLowerCase()
              ) || [];

              const outgoingTokens = tx.tokenTransfers?.filter(t => 
                t.from.toLowerCase() === searchAddress.toLowerCase()
              ) || [];

              const value = parseFloat(tx.value);
              const incomingValue = !isFromSearchAddress && value > 0 ? value : 0;
              const outgoingValue = isFromSearchAddress && value > 0 ? value : 0;

              return (
                <React.Fragment key={tx.hash}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a
                        href={tx.explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-blue-600 flex items-center gap-1 hover:text-blue-800"
                      >
                        {tx.hash.slice(0, 8)}...{tx.hash.slice(-6)}
                        <ExternalLink size={14} />
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tx.method || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatAddress(tx.from, isFromSearchAddress)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tx.to === 'Contract Creation' 
                        ? 'Contract Creation'
                        : formatAddress(tx.to, isToSearchAddress)}
                    </td>
                    <td className="px-6 py-4 text-sm text-green-600">
                      {incomingValue > 0 && `${incomingValue.toFixed(4)}`}
                      {incomingTokens.map((transfer, idx) => (
                        <div key={`in-qty-${idx}`}>
                          {parseFloat(transfer.value).toFixed(4)}
                        </div>
                      ))}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {incomingValue > 0 && network.symbol}
                      {incomingTokens.map((transfer, idx) => (
                        <div key={`in-asset-${idx}`}>
                          {transfer.token.symbol}
                        </div>
                      ))}
                    </td>
                    <td className="px-6 py-4 text-sm text-red-600">
                      {outgoingValue > 0 && `${outgoingValue.toFixed(4)}`}
                      {outgoingTokens.map((transfer, idx) => (
                        <div key={`out-qty-${idx}`}>
                          {parseFloat(transfer.value).toFixed(4)}
                        </div>
                      ))}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {outgoingValue > 0 && network.symbol}
                      {outgoingTokens.map((transfer, idx) => (
                        <div key={`out-asset-${idx}`}>
                          {transfer.token.symbol}
                        </div>
                      ))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(tx.timestamp), 'dd-MM-yyyy HH:mm:ss')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {tx.status ? (
                        <CheckCircle className="text-green-500" size={20} />
                      ) : (
                        <XCircle className="text-red-500" size={20} />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setExpandedTx(expandedTx === tx.hash ? null : tx.hash)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {expandedTx === tx.hash ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </button>
                    </td>
                  </tr>
                  {expandedTx === tx.hash && (
                    <tr>
                      <td colSpan={11}>
                        <TransactionDetails transaction={tx} network={network} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}