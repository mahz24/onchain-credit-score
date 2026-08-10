'use client';

import { ConnectWallet } from "@/app/components/ConnectWallets";
import { CreditScoreCard } from "./components/CreditScoreCard";
import { useConnection } from "wagmi";

export default function Home() {
  const { address, isConnected } = useConnection();

  return (
    <div className="flex flex-col flex-1 bg-zinc-50 font-sans dark:bg-black">
      <header className="flex items-center justify-between border-b border-black/[.08] px-8 py-4 dark:border-white/[.145]">
        <h1 className="text-lg font-semibold text-black dark:text-zinc-50">
          On-chain Credit Score
        </h1>
        <ConnectWallet />
      </header>

      <main className="flex flex-1 w-full max-w-3xl mx-auto flex-col items-start gap-6 py-16 px-8">
        <div className="flex flex-col gap-2">
          {isConnected ? (
            <CreditScoreCard address={address!} />
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Connect your wallet to view your credit score.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
