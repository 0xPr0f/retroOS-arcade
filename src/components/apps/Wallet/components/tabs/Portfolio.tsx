import { useState, useEffect } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { FaCopy } from "react-icons/fa";
import { Alchemy, Network } from "alchemy-sdk";
import { useAccount } from "wagmi";
import { formatEther } from "viem";
import noImage from "../../../../../../public/assets/noImage.jpg"



export function HomeContent() {
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [tLoading, setTLoading] = useState(false);
  const [nLoading, setNLoading] = useState(false);
  const [tokens, setTokens] = useState<any[]>([]);
  const [nfts, setNfts] = useState<any[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"tokens" | "nfts">("tokens");
  const { address, status, chain } = useAccount();

  const settings = {
    apiKey: "y_eQkk-xNUDYHBLvXhoipyEWcrq04D3D",
    network: Network.ETH_MAINNET,
  };
  const alchemy = new Alchemy(settings);

  useEffect(() => {
    async function fetchAccount() {
      
      try {
        if (status === "connected") {
          const balance = await alchemy.core.getBalance(address, "latest");
          setBalance(formatEther(BigInt(balance.toString())));
          console.log(`Balance of ${address}: ${balance} ETH`);
          setAccount(address);
          fetchTokens(address);
          fetchNFTs(address);
        } else {
          console.error("Address is undefined");
        }
      } catch (error) {
        console.error("Error fetching account:", error);
      }
    }

    async function fetchTokens(address: string) {
      setTLoading(true);
      let tokenData = [];
      try {
        const response = await alchemy.core.getTokenBalances(address);

        const nonZeroBalances = response.tokenBalances.filter((token) => {
          return token.tokenBalance !== "0";
        });

        console.log(`Token balances of ${address} \n`);

        // Counter for SNo of final output

        for (let token of nonZeroBalances) {
          const balance = token.tokenBalance;

          const metadata = await alchemy.core.getTokenMetadata(
            token.contractAddress
          );

          const fbalance = balance
            ? (Number(balance) / Math.pow(10, metadata.decimals ?? 18)).toFixed(
                2
              )
            : "0";

          const data = {
            name: metadata.name,
            balance: fbalance,
            symbol: metadata.symbol,
          };

          tokenData.push(data);
          // Print name, balance, and symbol of token
        }
        setTokens(tokenData);
      } catch (error) {
        console.error("Error fetching tokens:", error);
      }
      setTLoading(false);
    }

    async function fetchNFTs(address: string) {
      setNLoading(true);
      try {
        const nfts = await alchemy.nft.getNftsForOwner(address);

        // Print NFT details
        // Refer to https://docs.alchemy.com/reference/getnfts to print more fields

        setNfts(nfts.ownedNfts);
        console.log(nfts.ownedNfts);
      } catch (error) {
        console.error("Error fetching NFTs:", error);
      }
      setNLoading(false);
    }

    fetchAccount();
  }, []);

  return (
    <div className="min-h-screen flex ">
      <div className="w-full max-w-md p-6  rounded-lg">
        <h2 className="text-xl font-bold text-center mb-4">My Account</h2>

        {/* QR Code & Address */}
        <div className="flex flex-col items-center">
          {/* {account && <QRCode value={account} size={120} />} */}
          <div className="flex items-center mt-4 bg-gray-200 px-3 py-2 rounded-lg">
            <span className="truncate w-40">{account}</span>
            <CopyToClipboard
              text={account ? account : ""}
              onCopy={() => setCopied(true)}
            >
              <button className="ml-2 text-blue-500 hover:text-blue-700">
                <FaCopy />
              </button>
            </CopyToClipboard>
          </div>
          {copied && <p className="text-green-500 text-sm mt-1">Copied!</p>}
        </div>

        <div className="text-center mt-4">
          <p className="text-xl font-bold">
            {" "}
            Balance: {balance ? `${balance} ETH` : "Loading..."}
          </p>
        </div>

        <div className="flex justify-around mt-4">
          {["tokens", "nfts"].map((tab) => (
            <button
              key={tab}
              className={`px-6 py-2 font-medium  ${
                activeTab === tab
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-800"
              }`}
              onClick={() => setActiveTab(tab as "tokens" | "nfts")}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === "tokens" && (
          <div>
            <h3 className="text-lg font-semibold mb-3 mt-3">My Tokens</h3>
            {tLoading ? (
              <p className="text-gray-500 text-center">
                Loading transactions...
              </p>
            ) : (
              <div className="max-h-52 overflow-y-auto p-1  rounded-lg">
                <div className="mt-1">
                  {tokens.length > 0 ? (
                    <ul className="space-y-2">
                      {tokens?.map((token, index) => (
                        <li
                          key={index}
                          className="p-2 bg-gray-100 rounded-md flex justify-between"
                        >
                          <span className="truncate w-40">{token.name}</span>
                          <span className="font-semibold">
                            {token.balance} {token.symbol}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-sm">No tokens found.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* // NFT Grid Section */}
        {activeTab === "nfts" && (
          <div>
            <h3 className="text-lg font-semibold mb-3 mt-3">My NFTs</h3>
            {nLoading ? (
              <p className="text-gray-500 text-center">
                Loading transactions...
              </p>
            ) : (
              <div className="mt-6 max-h-52 overflow-y-auto p-4 rounded-lg">
                {nfts.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {nfts?.map((nft, index) => (
                      <div
                        key={index}
                        className="relative bg-gray-200 rounded-xl overflow-hidden shadow-md group hover:scale-105 transition-transform duration-300"
                        style={{
                          backgroundColor:
                            index % 2 === 0 ? "#E3F2FD" : "#F1F8E9",
                        }}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                      >
                        <img
                          src={nft.image.pngUrl || noImage.src}
                          alt={nft.name ? nft.name : nft.collection.name}
                          className={`w-full h-full object-cover transition-opacity duration-300 ${
                            hoveredIndex === index ? "opacity-0" : "opacity-100"
                          }`}
                        />

                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-3 py-1 text-sm rounded-md">
                          {nft.name
                            ? nft.name.length > 12
                              ? nft.name.slice(0, 12) + "..."
                              : nft.name
                            : nft.collection.name.length > 12
                            ? nft.collection.name.slice(0, 12) + "..."
                            : nft.collection.name}
                          {/* <span className="font-bold">
                          {nft.balance ? nft.balance : 1}
                        </span> */}
                        </div>
                        {hoveredIndex === index && (
                          <div className="absolute inset-0 bg-black bg-opacity-75 flex flex-col items-start  text-white p-4 transition-opacity duration-300">
                            <h3 className="font-semibold"> {nft.name
                            ? nft.name.length > 20
                              ? nft.name.slice(0, 20) + "..."
                              : nft.name
                            : nft.collection.name.length > 20
                            ? nft.collection.name.slice(0, 20) + "..."
                            : nft.collection.name}</h3>
                            <p className="text-sm">{nft.tokenType}</p>
                            <p className="flex-auto p-1  text-sm relative">#{nft.tokenId.length > 20 ? nft.tokenId.slice(0,20) + "..." : nft.tokenId}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No NFTs found.</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
