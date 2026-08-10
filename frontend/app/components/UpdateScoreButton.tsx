"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useEffect } from "react";
import {
  CREDIT_SCORE_ADDRESS,
  CREDIT_SCORE_ABI,
} from "@/lib/contracts/creditScore";

export function UpdateScoreButton({ onSuccess }: { onSuccess: () => void }) {
  const writeContract = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash: writeContract.data });

  useEffect(() => {
    if (isConfirmed) {
      onSuccess();
    }
  }, [isConfirmed, onSuccess]);

  const handleUpdate = () => {
    writeContract.mutate({
      address: CREDIT_SCORE_ADDRESS,
      abi: CREDIT_SCORE_ABI,
      functionName: "updateMyScore",
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleUpdate}
        disabled={writeContract.isPending || isConfirming}
        className="rounded-full bg-black text-white px-4 py-2 text-sm font-medium disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {writeContract.isPending
          ? "Waiting for signature..."
          : isConfirming
            ? "Confirming..."
            : "Update my score"}
      </button>
      {isConfirmed && <p className="text-sm text-green-600">Score updated!</p>}
      {writeContract.error && (
        <p className="text-sm text-red-600">{writeContract.error.message}</p>
      )}
    </div>
  );
}
