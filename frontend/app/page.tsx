"use client";

import { useConnection, useReadContract } from "wagmi";
import { ConnectWallet } from "@/app/components/ConnectWallets";
import { CreditScoreCard } from "./components/CreditScoreCard";
import { UpdateScoreButton } from "./components/UpdateScoreButton";
import { SearchWallet } from "./components/SearchWallet";
import { useHasMounted } from "@/lib/useHasMounted";
import {
  CREDIT_SCORE_ADDRESS,
  CREDIT_SCORE_ABI,
} from "@/lib/contracts/creditScore";
import { ScoreHistory } from "./components/ScoreHistory";

export default function Home() {
  const mounted = useHasMounted();
  const { address, isConnected } = useConnection();

  const { data, isLoading, refetch } = useReadContract({
    address: CREDIT_SCORE_ADDRESS,
    abi: CREDIT_SCORE_ABI,
    functionName: "profiles",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  return (
    <div className="flex flex-col flex-1 bg-zinc-50 font-sans dark:bg-black">
      <header className="flex items-center justify-between border-b border-black/[.08] px-8 py-4 dark:border-white/[.145]">
        <h1 className="text-lg font-semibold text-black dark:text-zinc-50">
          On-chain Credit Score
        </h1>
        <ConnectWallet />
      </header>

      <main className="flex flex-1 w-full max-w-3xl mx-auto flex-col items-start gap-10 py-16 px-8">
        <section className="flex flex-col gap-4 w-full">
          <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Your Score
          </h2>
          {!mounted || !isConnected ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Connect your wallet to view your credit score.
            </p>
          ) : (
            <>
              <CreditScoreCard
                data={
                  data as readonly [bigint, bigint, bigint, bigint] | undefined
                }
                isLoading={isLoading}
              />
              <ScoreHistory address={address!} />
              <UpdateScoreButton onSuccess={() => refetch()} />
            </>
          )}
        </section>

        <section className="flex flex-col gap-4 w-full">
          <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Search Any Wallet
          </h2>
          <SearchWallet />
        </section>
      </main>
    </div>
  );
}
