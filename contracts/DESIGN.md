# Design Decisions — On-chain Credit Score

## 1. Storage: Snapshot vs On-demand Calculation
**Decision**: On-chain snapshot stored in a mapping (`CreditProfile` struct).
**Why**: An on-demand `view` function cannot access a wallet's full transaction
history — that data lives outside the EVM, in an indexer/node. Storing snapshots
also better reflects a real credit system: scores are recalculated periodically,
not on every query.
**Trade-off accepted**: updating the score costs gas.

## 2. Access Control: Who Can Update the Score?
**Decision**: Hybrid — the user can update their own score (`updateMyScore`, no
restriction), and the owner can force an update for any address
(`forceUpdateScore`, `onlyOwner`).
**Why**: Simulates a real credit bureau — the user can request their own update,
but the evaluating entity can force recalculations (audits, disputes, bulk
updates).
**Trade-off accepted**: the owner is a centralization point — acceptable for a
portfolio MVP, but documented as a known limitation (see "Limitations" section
below).

## 3. OpenZeppelin Version
**Decision**: v5.7.0.
**Why**: Installed by default via `forge install`. Requires passing
`Ownable(msg.sender)` explicitly in the constructor (breaking change vs v4).

## 4. Definition of "Wallet Age"
**Decision**: `firstSeenBlock` = the block in which the wallet first interacts
WITH THIS CONTRACT, not its first-ever transaction on the blockchain.
**Why**: A contract cannot read a wallet's full on-chain history — that requires
off-chain indexing. This is a conscious simplification for the MVP.
**Known limitation**: an old wallet that never used the contract before will
appear "new" for scoring purposes.

## 5. Wallet Activity Signal
**Decision**: We count interactions with our own contract only.
**Why**: Solidity has no native access to an account's global transaction
history (nonce) from within a contract — that data is only visible off-chain,
via RPC calls or indexers. `interactionCount` is therefore scoped to this
contract, same simplification rationale as wallet age (see section 4).

## 6. Score Formula
```js
balancePoints = min(balance, BALANCE_CAP) * 400 / BALANCE_CAP
agePoints     = min(blocksSinceFirstSeen, AGE_CAP) * 350 / AGE_CAP
activityPoints = min(interactionCount, ACTIVITY_CAP) * 250 / ACTIVITY_CAP

score = balancePoints + agePoints + activityPoints
```
**Caps**: `BALANCE_CAP = 10 ether`, `AGE_CAP = 2_160_000` blocks (~6 months on
Ethereum mainnet, ~12s/block), `ACTIVITY_CAP = 50` interactions. All caps are
arbitrary product decisions for this MVP, not derived from real credit-scoring
data.
**Note on real-world block timing**: in local Foundry tests, `firstSeenBlock`
and the calculation block are identical within a single simulated transaction,
so `agePoints` is exactly `0` on first use. On a live network (Sepolia), real
time elapses between transactions, so `agePoints` can be a small non-zero value
even shortly after a wallet's first interaction — this is expected behavior,
not a bug.

## 7. Testing Strategy
**Decision**: Three layers of testing, each validating a different guarantee:
- **Unit tests** (7 tests, 100% line/statement/branch coverage) — core logic,
  edge cases (first-time user, balance cap boundaries), and access control.
- **Fuzz testing** (256 runs) — confirms the score formula never exceeds 1000
  across randomized balances and update counts, using `bound()` to keep inputs
  within realistic domain ranges rather than the full `uint256` space.
- **Invariant testing** (Handler-based, 128,000 calls across 256 runs) —
  confirms the same invariant holds across randomized, multi-actor interaction
  sequences (not just a single fixed call pattern), using a fixed pool of
  actors for traceability and to force realistic repeat-usage scenarios.
**Why**: Unit tests prove specific scenarios are correct; fuzz and invariant
tests prove the *mathematical guarantee* (score ∈ [0, 1000]) holds broadly,
not just for the cases we thought to write by hand.

## 8. Deployment
**Network**: Sepolia testnet.
**Address**: `0x0Ccf15a73f48E99EA0676a7A935D27Fce1272151` (verified).
**Deploy block**: `11456129`.
**Why Sepolia**: Standard, well-supported Ethereum testnet for portfolio/demo
purposes — no real funds at risk, publicly verifiable on Etherscan.

## 9. Frontend Architecture
**Stack**: Next.js (App Router) + wagmi v3 + viem, connected via the `injected`
connector (browser wallets like MetaMask).

**History display — event logs vs on-chain storage**: The contract does not
store score history (see section 1 — only the latest snapshot is kept). Rather
than modifying and redeploying the verified contract to add on-chain history
(which would add ongoing gas cost per update), the frontend reconstructs score
history by reading `ScoreCalculated` event logs directly via `getLogs`, scoped
to this contract's deploy block onward. This mirrors how real-world indexers
(e.g. The Graph) work: events are cheap to emit and permanently queryable from
logs, without paying to persist redundant state on-chain.
**Trade-off accepted**: history queries depend on the RPC provider's log-query
range support, and are re-fetched on every card render rather than cached —
acceptable for MVP scope, a candidate for later optimization if wallet lookups
become frequent.

**State ownership**: `useReadContract` for the connected user's score lives in
the page component (not inside the card component), so its `refetch` function
can be passed down to the update button — this lets a successful score update
trigger an automatic re-read without a manual page refresh, since sibling
components (`CreditScoreCard` and `UpdateScoreButton`) can't otherwise
communicate directly.

**Hydration handling**: Wallet connection state (`isConnected`, `address`) is
only known in the browser, not during server-side rendering. Any component
that branches on this state uses a `useHasMounted` guard (via
`useSyncExternalStore`) to render an identical, neutral first pass on both
server and client, avoiding React hydration mismatches — this was a recurring
issue during development and is now a consistent pattern across all
wallet-aware components.

## Known Limitations / Attack Vectors

### Flash Loan Manipulation
**Issue**: `_calculateScore` reads `user.balance` as an instantaneous snapshot.
An attacker can take a flash loan, call `updateMyScore()` within the same
transaction to inflate their `balancePoints`, repay the loan, and keep the
inflated score permanently stored — all atomically, with no real capital at risk.

**Status**: Identified, not mitigated in this MVP. Documented as a known scope
decision.

**Mitigation strategy (not implemented)**: Split the update flow into two
separate calls across different blocks — `requestUpdate()` records the
requesting block, and `finalizeUpdate()` can only execute in a later block,
reading the balance only then. Since a flash loan is repaid within a single
atomic transaction (and therefore a single block), this breaks the attack:
the borrowed funds must be returned before the second block — and thus the
second call — can occur. This is the same pattern used by protocols like
Compound for time-weighted voting power.

**Why not implemented now**: Adds meaningful complexity (state tracking across
two calls, cooldown windows) for an MVP whose primary goal is demonstrating
the core scoring mechanism and security-aware design decisions, not
production-grade robustness.