import React from 'react';
import { Coins } from 'lucide-react';
import type { NetworkBalance } from '../api';

interface BalanceSummaryProps {
  balances: NetworkBalance[];
  isLoading: boolean;
}

export function BalanceSummary({ balances, isLoading }: BalanceSummaryProps) {
  if (isLoading) {
    return (
      <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!balances.length) {
    return null;
  }

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-blue-500" />
          <h2 className="text-lg font-medium text-gray-900">Balance Summary</h2>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {balances.map((networkBalance) => (
          <div
            key={networkBalance.network.id}
            className="bg-gray-50 rounded-lg p-4 border border-gray-200"
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-gray-900">
                {networkBalance.network.name}
              </h3>
              <span className="text-sm text-gray-500">
                {networkBalance.network.symbol}
              </span>
            </div>
            <div className="space-y-2">
              {parseFloat(networkBalance.nativeBalance) > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Native Balance</span>
                  <span className="font-medium">
                    {parseFloat(networkBalance.nativeBalance).toFixed(4)} {networkBalance.network.symbol}
                  </span>
                </div>
              )}
              {networkBalance.tokens.map((token, idx) => (
                parseFloat(token.value) > 0 && (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">{token.token.symbol}</span>
                    <span className="font-medium">
                      {parseFloat(token.value).toFixed(4)}
                    </span>
                  </div>
                )
              ))}
              {parseFloat(networkBalance.nativeBalance) === 0 && networkBalance.tokens.length === 0 && (
                <div className="text-sm text-gray-500 text-center">
                  No balance
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}