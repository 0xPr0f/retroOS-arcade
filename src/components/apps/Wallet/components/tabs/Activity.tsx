
"use client";
import { useState, useEffect } from "react";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import {Alchemy, Network, AssetTransfersCategory} from "alchemy-sdk";
import { Check, Copy, Link } from "lucide-react";
import { copyToClipboard } from "@/components/pc/drives";


const settings = {
  apiKey: "y_eQkk-xNUDYHBLvXhoipyEWcrq04D3D",
  network: Network.ETH_MAINNET,
};

export function ActivityContent() {
  const [account, setAccount] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const { address, status } = useAccount();
  const alchemy = new Alchemy(settings);

  
  

  useEffect(() => {
    
    if (typeof window === "undefined") return;

    async function fetchTransactions(userAddress: string) {
      setLoading(true);
      try {
        const txns = await alchemy.core.getAssetTransfers({
          fromBlock: "0x0",
          fromAddress: userAddress,
          category: [
            AssetTransfersCategory.EXTERNAL,
            AssetTransfersCategory.INTERNAL,
            AssetTransfersCategory.ERC20,
            AssetTransfersCategory.ERC721,
            AssetTransfersCategory.ERC1155,
          ],
        });

        
        setTransactions(txns.transfers.slice(-50));
        console.log(txns.transfers.slice(-50));
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
      setLoading(false);
    }

    if (status === "connected" && address) {
      fetchTransactions(address);
    }
  }, [status, address]);

  return (
    <div className="h-fit relative flex bg-gray-100 p-2 pb-0">
      <div className="w-full p-4  bg-white rounded-lg">
        <h2 className="text-xl font-bold text-center mb-4">
          Transaction History
        </h2>

        {/* User Address */}
        {account && (
          <div className="flex justify-center items-center bg-gray-200 px-4 py-2 rounded-lg">
            <span className="truncate w-40 text-gray-800">{account}</span>
          </div>
        )}

        {/* Transactions List */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-1">Recent Transactions</h3>

          {loading ? (
            <p className="text-gray-500 text-center">Loading transactions...</p>
          ) : transactions.length > 0 ? (
            <div className="max-h-96 overflow-y-auto p-1 border border-gray-300 rounded-lg">
<ul className="space-y-3">
              {transactions?.slice(0, 10).reverse().map((tx, index) => (
                <li
                  key={index}
                  className="p-3 bg-gray-100 rounded-lg shadow-sm"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Tx Hash:</span>
                    <div className="flex items-center space-x-2">
                      <a
                        href={`https://etherscan.io/tx/${tx.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline flex items-center"
                      >
                        {tx?.hash.substring(0, 10)}...{tx?.hash.slice(-10)}
                        <Link className="ml-1 text-xs" />
                      </a>
                      {tx.hash}
                      {copiedHash && copiedHash?.length > 1 ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy
                  className="w-4 h-4 cursor-pointer"
                  onClick={() => {
                    copyToClipboard(tx.hash)

                    setCopiedHash("")
                    setTimeout(
                      () => setCopiedHash((tx.hash)),
                      2000
                    )
                  }}
                />
              )}
                   
                    </div>
                  </div>

                  <div className="flex justify-between mt-2 text-sm">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-semibold">
                      {(tx?.value)} {tx.asset}
                    </span>
                  </div>

                  <div className="flex justify-between mt-2 text-sm">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium">
                      {tx.category}
                    </span>
                  </div>

                  {copiedHash === tx.hash && (
                    <p className="text-green-500 text-xs mt-1">Copied!</p>
                  )}
                </li>
              ))}
            </ul>
            </div>
            
          ) : (
            <p className="text-gray-500 text-sm">No transactions found.</p>
          )}
        </div>
      </div>
    </div>
  );
};
