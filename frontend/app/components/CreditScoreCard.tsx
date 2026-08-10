"use client";

type CreditScoreCardProps = {
  data: readonly [bigint, bigint, bigint, bigint] | undefined;
  isLoading: boolean;
};

export function CreditScoreCard({ data, isLoading }: CreditScoreCardProps) {
  if (isLoading) return <p>Loading score...</p>;
  if (!data) return null;

  const [score, lastUpdated, firstSeenBlock, interactionCount] = data;

  return (
    <div className="rounded-lg border border-black/[.08] p-6 dark:border-white/[.145]">
      <h2 className="text-sm text-zinc-500 dark:text-zinc-400">Credit Score</h2>
      <p className="text-4xl font-bold">{score.toString()} / 1000</p>
      <dl className="mt-4 grid grid-cols-2 gap-2 text-sm text-zinc-600 dark:text-zinc-400">
        <dt>First seen block</dt>
        <dd>{firstSeenBlock.toString()}</dd>
        <dt>Interactions</dt>
        <dd>{interactionCount.toString()}</dd>
        <dt>Last updated</dt>
        <dd>{lastUpdated.toString()}</dd>
      </dl>
    </div>
  );
}
