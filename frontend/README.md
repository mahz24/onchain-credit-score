# On-chain Credit Score — Frontend

Next.js app for interacting with the [On-chain Credit Score](../contracts) smart contract: connect a wallet, view and update your own score, look up any wallet's score, and browse score history reconstructed from on-chain events.

**Live demo**: [link once deployed]
**Contract**: [`0x0Ccf15a73f48E99EA0676a7A935D27Fce1272151`](https://sepolia.etherscan.io/address/0x0ccf15a73f48e99ea0676a7a935d27fce1272151) on Sepolia (verified)

## Features

- **Connect wallet** — browser wallet connection via wagmi's `injected` connector (MetaMask, etc.)
- **View & update your score** — reads your on-chain profile and lets you trigger a recalculation, with live transaction status (waiting for signature → confirming → confirmed)
- **Search any wallet** — look up the score of any Ethereum address, since `profiles` is a public mapping
- **Score history** — reconstructed per-wallet from `ScoreCalculated` event logs (the contract only stores the latest snapshot; see [`../contracts/DESIGN.md`](../contracts/DESIGN.md#9-frontend-architecture) for why)

## Tech Stack

- **Next.js** (App Router)
- **wagmi v3** + **viem** — note: v3 renamed several hooks and standardized mutations behind `.mutate()`/`.mutateAsync()` (e.g. `useAccount` → `useConnection`). If you're following older wagmi tutorials, expect syntax differences.
- **TypeScript**, **Tailwind CSS**
- **pnpm**

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

You'll need a browser wallet (e.g. MetaMask) connected to the **Sepolia** testnet, with some Sepolia ETH if you want to trigger score updates (a faucet is enough — no real funds needed).

## Project Structure

app/
page.tsx # main page: orchestrates own-score + search sections
providers.tsx # WagmiProvider + QueryClientProvider setup
components/
ConnectWallets.tsx # wallet connect/disconnect button
CreditScoreCard.tsx # presentational score display (data passed via props)
UpdateScoreButton.tsx# triggers updateMyScore(), reports success to parent
SearchWallet.tsx # address input + lookup for any wallet
ScoreHistory.tsx # reads ScoreCalculated event logs for a given address
lib/
wagmi.ts # wagmi config (Sepolia only, injected connector)
useHasMounted.ts # SSR/hydration-safe "are we on the client" hook
contracts/
creditScore.ts # contract address + deploy block constants
creditScoreAbi.json # ABI extracted from the Foundry build artifact

## Syncing the ABI

The ABI is extracted from the Foundry build output rather than hand-copied, to avoid drift between the contract and frontend:

```bash
node extract-abi.js
```

Run this after any change to `../contracts/src/CreditScore.sol` followed by `forge build`.

## Notable Implementation Decisions

- **Own-score state lives in `page.tsx`, not inside the card component** — so a successful `updateMyScore()` transaction can trigger `refetch()` on the score read and update the UI automatically, without a manual page reload. Sibling components can't otherwise talk to each other directly.
- **Hydration-safe wallet state** — any component branching on `isConnected` uses a `useHasMounted` guard, since wallet connection state is only known in the browser and differs from the server's initial render.
- **History is read from event logs**, not stored on-chain, to avoid redeploying the (already verified) contract and to keep gas costs down. See `DESIGN.md` in the contracts package for the full rationale.

## Related

- [Smart contract & full design rationale](../contracts)