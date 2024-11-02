import React, { useState } from 'react';
import { Coins } from 'lucide-react';
import type { TokenBalance } from '../api';

const PAGE_SIZE_OPTIONS = [5, 10, 20, 25, 50, 100];

interface NetworkBalancesProps {
  balances: TokenBalance[];
}

const NetworkBalances = ({ balances }: NetworkBalancesProps) => {
  const [pageSize, setPageSize] = useState(10);

  // Group balances by network
  const balancesByNetwork = balances.reduce((acc, balance) => {
    if (!acc[balance.networkId]) {
      acc[balance.networkId] = [];
    }
    acc[balance.networkId].push(balance);
    return acc;
  }, {} as Record<string, TokenBalance[]>);

  // Get networks with any balances
  const networksWithBalances = Object.entries(balancesByNetwork)
    .filter(([_, networkBalances]) => networkBalances.length > 0)
    .slice(0, pageSize);

  if (networksWithBalances.length === 0) return null;

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200 mb-6">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-blue-500" />
          <h2 className="text-lg font-medium text-gray-900">Wallet Balances</h2>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="balancePageSize" className="text-sm text-gray-600">
            Show:
          </label>
          <select
            id="balancePageSize"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {networksWithBalances.map(([networkId, networkBalances]) => (
          <div
            key={networkId}
            className="bg-gray-50 rounded-lg p-4 border border-gray-200"
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-gray-900 capitalize">
                {networkId}
              </h3>
            </div>
            <div className="space-y-2">
              {networkBalances.map((balance, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">
                    {balance.token.name} ({balance.token.symbol})
                  </span>
                  <span className="font-medium">
                    {parseFloat(balance.value).toFixed(6)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NetworkBalances;