"use client";

import { useState } from "react";
import { isAddress } from "viem";
import { useReadContract } from "wagmi";
import {
  CREDIT_SCORE_ADDRESS,
  CREDIT_SCORE_ABI,
} from "@/lib/contracts/creditScore";
import { CreditScoreCard } from "./CreditScoreCard";
import { ScoreHistory } from "./ScoreHistory";

export function SearchWallet() {
  const [input, setInput] = useState("");
  const [searchedAddress, setSearchedAddress] = useState<`0x${string}` | null>(
    null,
  );

  const { data, isLoading } = useReadContract({
    address: CREDIT_SCORE_ADDRESS,
    abi: CREDIT_SCORE_ABI,
    functionName: "profiles",
    args: searchedAddress ? [searchedAddress] : undefined,
    query: { enabled: !!searchedAddress },
  });

  const handleSearch = () => {
    if (isAddress(input)) {
      setSearchedAddress(input);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="0x..."
          className="flex-1 rounded border border-black/[.08] px-3 py-2 text-sm font-mono dark:border-white/[.145] dark:bg-black"
        />
        <button
          onClick={handleSearch}
          className="rounded-full border border-black/[.08] px-4 py-2 text-sm dark:border-white/[.145]"
        >
          Search
        </button>
      </div>

      {input.length > 0 && !isAddress(input) && (
        <p className="text-sm text-red-600">Invalid Ethereum address.</p>
      )}

      {searchedAddress && (
        <>
          <CreditScoreCard
            data={data as readonly [bigint, bigint, bigint, bigint] | undefined}
            isLoading={isLoading}
          />
          <ScoreHistory address={searchedAddress} />
        </>
      )}
    </div>
  );
}
