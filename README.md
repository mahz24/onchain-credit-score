# On-chain Credit Score

A Solidity smart contract — with a companion Next.js frontend — that calculates a wallet's "credit score" (0-1000) based on on-chain signals: ETH balance, wallet age (relative to first interaction), and activity level. Built as a proof-of-concept bridging fintech credit-scoring concepts with on-chain data — an intersection of my background in fintech backend systems and smart contract development.

**Live on Sepolia**: [`0x0Ccf15a73f48E99EA0676a7A935D27Fce1272151`](https://sepolia.etherscan.io/address/0x0ccf15a73f48e99ea0676a7a935d27fce1272151) (verified)
**Live demo (frontend)**: [link once deployed]

## Repository Structure

contracts/ # Foundry project: contract, tests, deploy script, DESIGN.md
frontend/ # Next.js app: connect wallet, view/update score, search, history

Each package has its own README with setup instructions — see [`contracts/README.md`](./contracts/README.md) and [`frontend/README.md`](./frontend/README.md).

## Overview

Traditional credit bureaus score users based on payment history, account age, and utilization. This project explores what a similar system looks like when the only available signals are on-chain: how long a wallet has interacted with the protocol, how active it's been, and its current holdings.

Rather than calculating scores on-demand, the contract stores a snapshot per user — closer to how real credit-scoring systems periodically recalculate and persist a score rather than recompute it on every query. The frontend then reconstructs full score history from on-chain event logs, without requiring any changes to the deployed contract.

## Score Formula

| Signal | Max Points | Basis |
|---|---|---|
| ETH Balance | 400 | Capped at 10 ETH |
| Wallet Age | 350 | Blocks since first interaction with this contract, capped at ~6 months |
| Activity | 250 | Number of score updates, capped at 50 |

Full formula rationale, caps, and design trade-offs documented in [`contracts/DESIGN.md`](./contracts/DESIGN.md).

## Testing

100% line, statement, and branch coverage on the contract, combining unit, fuzz, and invariant testing — 7 unit tests, a 256-run fuzz test, and a Handler-based invariant test with 128,000 simulated calls. Details in [`contracts/README.md`](./contracts/README.md#testing).

## Known Limitations

The contract is vulnerable to flash-loan balance manipulation, since `balancePoints` reads `user.balance` as an instantaneous snapshot. This is a known, documented limitation — not patched in this MVP, with a designed (but intentionally unimplemented) mitigation. Full analysis in [`contracts/DESIGN.md`](./contracts/DESIGN.md#known-limitations--attack-vectors).

## Author

**Marco Zuñiga** — Full Stack Engineer transitioning into blockchain development, with a background in fintech backend systems (credit flows, payment processing).

[GitHub](https://github.com/mahz24) · [LinkedIn](#)