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
**Decision**: We count interactions with own contract.
**Why**: Solidity has not access to all blockchain else own contract only.

## 6. Score Formula.
```js
balancePoints = min(balance, BALANCE_CAP) * 400 / BALANCE_CAP
agePoints     = min(blocksSinceFirstSeen, AGE_CAP) * 350 / AGE_CAP
activityPoints = min(interactionCount, ACTIVITY_CAP) * 250 / ACTIVITY_CAP

score = balancePoints + agePoints + activityPoints
```



## Open / Upcoming Decisions
- [ ] Exact score calculation formula (Step 4)
- [ ] Range and weighting of each signal (balance, nonce, age)