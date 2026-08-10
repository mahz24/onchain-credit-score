"use client";

import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { parseAbiItem } from "viem";
import {
  CREDIT_SCORE_ADDRESS,
  CREDIT_SCORE_DEPLOY_BLOCK,
} from "@/lib/contracts/creditScore";

type ScoreEvent = {
  score: bigint;
  timestamp: bigint;
  blockNumber: bigint;
};

export function ScoreHistory({ address }: { address: `0x${string}` }) {
  const publicClient = usePublicClient();
  const [events, setEvents] = useState<ScoreEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!publicClient) return;

    async function fetchHistory() {
      setIsLoading(true);
      const logs = await publicClient!.getLogs({
        address: CREDIT_SCORE_ADDRESS,
        event: parseAbiItem(
          "event ScoreCalculated(address indexed user, uint256 score, uint256 timestamp)",
        ),
        args: { user: address },
        fromBlock: CREDIT_SCORE_DEPLOY_BLOCK,
        toBlock: "latest",
      });

      const parsed = logs.map((log) => ({
        score: log.args.score!,
        timestamp: log.args.timestamp!,
        blockNumber: log.blockNumber,
      }));

      setEvents(parsed);
      setIsLoading(false);
    }

    fetchHistory();
  }, [publicClient, address]);

  if (isLoading)
    return <p className="text-sm text-zinc-500">Loading history...</p>;
  if (events.length === 0)
    return <p className="text-sm text-zinc-500">No history yet.</p>;

  return (
    <ul className="flex flex-col gap-2">
      {events.map((event, i) => (
        <li
          key={i}
          className="flex justify-between text-sm border-b border-black/[.08] pb-2 dark:border-white/[.145]"
        >
          <span>Score: {event.score.toString()}</span>
          <span className="text-zinc-500">
            Block {event.blockNumber.toString()}
          </span>
        </li>
      ))}
    </ul>
  );
}
