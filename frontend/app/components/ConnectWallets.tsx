"use client";

import { useConnection, useConnect, useDisconnect, useConnectors } from "wagmi";

export function ConnectWallet() {
  const connect = useConnect();
  const disconnect = useDisconnect();
  const connectors = useConnectors();
  const { isConnected, address } = useConnection();

  if (isConnected) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm font-mono">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </span>
        <button onClick={() => disconnect.mutate()} className="text-sm underline">
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => connect.mutate({ connector: connectors[0] })}
      className="rounded-full bg-white text-black px-4 py-2 text-sm font-medium"
    >
      Connect Wallet
    </button>
  );
}
