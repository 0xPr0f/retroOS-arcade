
import { Address, type Hex } from "viem";

interface PriceQueryParams {
  chainId: string;
  sellToken: string;
  buyToken: string;
  sellAmount: string;
  taker: string;
}


interface ZeroXPriceResponse {
  
    sellToken: string;
    buyToken: string;
    sellAmount: string;
    buyAmount: string;
    grossSellAmount: string;
    grossBuyAmount: string;
    allowanceTarget: Address;
    route: [];
    fees: {
      integratorFee: {
        amount: string;
        token: string;
        type: "volume" | "gas";
      } | null;
      zeroExFee: {
        billingType: "on-chain" | "off-chain";
        feeAmount: string;
        feeToken: Address;
        feeType: "volume" | "gas";
      };
      gasFee: null;
    } | null;
    gas: string;
    gasPrice: string;
    auxiliaryChainData?: {
      l1GasEstimate?: number;
    
  };
}

export default async function handler(
  req: {
    query: PriceQueryParams;
  },
  res: {
    status: (code: number) => {
      json: (data: any) => void;
    };
  }
) {
  // const response = await fetch(`/api/price/route?chainId=${chainId}&sellToken=${sellToken.address}&buyToken=${buyToken?.address}&sellAmount=${sellAmount}&taker=${address}`);
  try {
    
    const { chainId, sellToken, buyToken, sellAmount, taker } = req.query;
     console.log(chainId, sellToken, buyToken, sellAmount, taker);
    
    const apiUrl = `https://api.0x.org/swap/permit2/price?chainId=${chainId}&sellToken=${sellToken}&buyToken=${buyToken}&sellAmount=${sellAmount}&taker=${taker}`;

    
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "0x-api-key": process.env.NEXT_PUBLIC_ZEROEX_API_KEY as string,
        "0x-version": "v2",
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching price: ${response.statusText}`);
    }

    const data: ZeroXPriceResponse = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}

// import { type NextRequest } from "next/server";

// export async function GET(request: NextRequest) {
//   const searchParams = request.nextUrl.searchParams;
  
//   console.log("searchParams", searchParams);
//   try {
//     const res = await fetch(
//       `https://api.0x.org/swap/permit2/price?${searchParams}`,
//       {
//         headers: {
//           "0x-api-key": process.env.NEXT_PUBLIC_ZEROEX_API_KEY as string,
//           "0x-version": "v2",
//         },
//       }
//     );
//     const data = await res.json();

//     console.log(
//       "price api",
//       `https://api.0x.org/swap/permit2/price?${searchParams}`
//     );

//     console.log("price data", data);

//     return Response.json(data);
//   } catch (error) {
//     console.log(error);
//   }
// }