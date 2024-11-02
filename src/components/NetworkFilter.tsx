import React from 'react';
import type { Network } from '../api';

interface NetworkFilterProps {
  networks: Network[];
  selectedNetwork: Network;
  onNetworkChange: (network: Network) => void;
}

export function NetworkFilter({ networks, selectedNetwork, onNetworkChange }: NetworkFilterProps) {
  if (!networks.length) return null;

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="network-filter" className="text-sm text-gray-600">
        Network:
      </label>
      <select
        id="network-filter"
        value={selectedNetwork.id}
        onChange={(e) => {
          const network = networks.find(n => n.id === e.target.value);
          if (network) onNetworkChange(network);
        }}
        className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      >
        {networks.map(network => (
          <option key={network.id} value={network.id}>
            {network.name}
          </option>
        ))}
      </select>
    </div>
  );
}