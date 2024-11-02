import React, { useState } from 'react';
import { Image } from 'lucide-react';

const PAGE_SIZE_OPTIONS = [5, 10, 20, 25, 50, 100];

interface NFT {
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

interface NFTListProps {
  nfts: NFT[];
}

function NFTList({ nfts }: NFTListProps) {
  const [pageSize, setPageSize] = useState(10);
  
  // Filter out NFTs without images
  const validNFTs = nfts.filter(nft => nft.imageUrl);
  
  const displayedNFTs = validNFTs.slice(0, pageSize);
  const hasMoreNFTs = validNFTs.length > pageSize;

  if (validNFTs.length === 0) return null;

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200 mb-6">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Image className="h-5 w-5 text-blue-500" />
          <h2 className="text-lg font-medium text-gray-900">NFT Collection</h2>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="nftPageSize" className="text-sm text-gray-600">
            Show:
          </label>
          <select
            id="nftPageSize"
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        {displayedNFTs.map((nft) => (
          <div 
            key={`${nft.collection.address}-${nft.tokenId}`} 
            className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-shadow duration-200"
          >
            <div className="aspect-square w-full relative bg-gray-200">
              <img
                src={nft.imageUrl}
                alt={nft.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://placehold.co/400x400/e5e7eb/a1a1aa?text=No+Image';
                }}
              />
            </div>
            <div className="p-4">
              <h3 className="font-medium text-gray-900 truncate">{nft.name}</h3>
              <p className="text-sm text-gray-500 truncate mt-1">{nft.collection.name}</p>
              <div className="flex items-center mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                  {nft.network}
                </span>
              </div>
              {nft.description && (
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{nft.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
      {hasMoreNFTs && (
        <div className="text-sm text-gray-500 text-center py-4 border-t border-gray-200">
          And {validNFTs.length - pageSize} more NFTs...
        </div>
      )}
    </div>
  );
}

export default NFTList;