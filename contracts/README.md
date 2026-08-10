# On-chain Credit Score

A Solidity smart contract that calculates a wallet's "credit score" (0-1000) based on on-chain signals: ETH balance, wallet age (relative to first interaction), and activity level. Built as a proof-of-concept bridging fintech credit-scoring concepts with on-chain data — an intersection of my background in fintech backend systems and smart contract development.

**Live on Sepolia**: [`0x0Ccf15a73f48E99EA0676a7A935D27Fce1272151`](https://sepolia.etherscan.io/address/0x0ccf15a73f48e99ea0676a7a935d27fce1272151) (verified)

## Overview

Traditional credit bureaus score users based on payment history, account age, and utilization. This project explores what a similar system looks like when the only available signals are on-chain: how long a wallet has interacted with the protocol, how active it's been, and its current holdings.

Rather than calculating scores on-demand, the contract stores a snapshot per user — closer to how real credit-scoring systems periodically recalculate and persist a score rather than recompute it on every query.

## Score Formula

| Signal | Max Points | Basis |
|---|---|---|
| ETH Balance | 400 | Capped at 10 ETH |
| Wallet Age | 350 | Blocks since first interaction with this contract, capped at ~6 months |
| Activity | 250 | Number of score updates, capped at 50 |

All components are combined into a single score from 0 to 1000. Full formula rationale and caps documented in [`DESIGN.md`](./DESIGN.md).

## Access Control

- `updateMyScore()` — any user can recalculate their own score, anytime.
- `forceUpdateScore(address)` — owner-only, simulating a credit bureau forcing a recalculation (audits, disputes, bulk updates).

## Tech Stack

- **Solidity** ^0.8.18
- **Foundry** (Forge, for testing and deployment)
- **OpenZeppelin Contracts** v5.7.0 (`Ownable`, `Math`)

## Testing

100% line, statement, and branch coverage, combining unit, fuzz, and invariant testing:

- **7 unit tests** — core logic, edge cases (first-time users, balance cap boundaries), and access control.
- **1 fuzz test** (256 runs) — confirms the score never exceeds 1000 across randomized balances and update counts.
- **1 invariant test** (128,000 handler calls across 256 runs) — confirms the invariant holds across randomized multi-actor interaction sequences, using a Handler contract to simulate realistic usage patterns.

```bash
forge test
forge coverage
```

## Known Limitations

The contract is vulnerable to flash-loan balance manipulation: since `balancePoints` reads `user.balance` as an instantaneous snapshot, an attacker could inflate their balance within a single atomic transaction to game their score. This is a known, documented limitation — not patched in this MVP. A two-step mitigation (splitting score requests and finalization across separate blocks) is designed but intentionally not implemented, to keep the MVP scope focused on the core scoring mechanism. Full analysis in [`DESIGN.md`](./DESIGN.md).

## Getting Started

```bash
git clone https://github.com/mahz24/onchain-credit-score.git
cd onchain-credit-score/contracts
forge install
forge build
forge test
```

## Deployment

```bash
forge script script/DeployCreditScore.s.sol:DeployCreditScore \
  --rpc-url $SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify \
  --etherscan-api-key $ETHERSCAN_API_KEY
```

Requires a `.env` file with `SEPOLIA_RPC_URL`, `PRIVATE_KEY`, and `ETHERSCAN_API_KEY`.

## Design Decisions

All architectural decisions — storage model, access control, wallet-age definition, score formula, and known attack vectors — are documented in [`DESIGN.md`](./DESIGN.md).

## Author

**Marco Zuñiga** — Full Stack Engineer transitioning into blockchain development, with a background in fintech backend systems (credit flows, payment processing).

[GitHub](https://github.com/mahz24) · [LinkedIn](https://www.linkedin.com/in/marco-zu%C3%B1iga-29b938200/)