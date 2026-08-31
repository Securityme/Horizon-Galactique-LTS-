# Security Specification - Horizon Galactique: L'Arche des Étoiles

## 1. Data Invariants
1. **User Identity Invariant**: An Archonte user profile at `/users/{userId}` can only be created and updated by the authenticated user matching `{userId}` (`request.auth.uid == userId`).
2. **Private Game Saves Invariant**: Game saves under `/users/{userId}/saves/{saveId}` are strictly private. Read, create, update, and delete access is restricted to the owner (`request.auth.uid == userId`).
3. **Save Identity Immutability**: The `userId` within the `GameSave` data must match `request.auth.uid` on creation and cannot be modified.
4. **Public Archives Invariant**: Any user can read the public hall of records `/public_archives/{archiveId}`. Writes require authentication where `incoming().authorId == request.auth.uid`. Updates and deletes are restricted to the author.
5. **Payload Bounds & Type Checks**: All strings must be length-constrained (e.g., `gameStateJson <= 800000` chars), and IDs must match alphanumeric patterns (`^[a-zA-Z0-9_-]+$`).
6. **No Client Query Delegation**: All list queries are secured through explicit resource owner evaluation.

## 2. The Dirty Dozen Attack Payloads
1. **Spoofed User Creation**: Attempting to create `/users/victim_user` with `request.auth.uid = attacker_user` -> MUST BE REJECTED.
2. **Save Shadow Update**: Injecting a rogue `isAdmin: true` field into a game save update -> MUST BE REJECTED.
3. **Cross-User Save Theft**: Authenticated user B attempting to read `/users/userA/saves/save1` -> MUST BE REJECTED.
4. **Cross-User Save Injection**: User B attempting to write to `/users/userA/saves/save_hacked` -> MUST BE REJECTED.
5. **Oversized Game State DOS**: Attempting to upload a `gameStateJson` > 800,000 characters -> MUST BE REJECTED.
6. **Unauthenticated Public Archive Write**: Unauthenticated client attempting to write to `/public_archives/fake_record` -> MUST BE REJECTED.
7. **Public Archive Author Spoofing**: Authenticated user A attempting to set `authorId: 'victimB'` on `/public_archives/new_arch` -> MUST BE REJECTED.
8. **Malicious ID Injection**: Attempting document creation with 10KB junk-character document ID -> MUST BE REJECTED by `isValidId`.
9. **Game Save Ownership Hijack**: Updating existing game save to change `userId` from user A to user B -> MUST BE REJECTED.
10. **Public Archive Modification by Non-Author**: User B attempting to delete or overwrite User A's public archive entry -> MUST BE REJECTED.
11. **Negative Resource Invariants**: Attempting to store negative population or negative seed values -> MUST BE REJECTED.
12. **Blanket Query Scraping**: Attempting to run unconstrained list queries on another user's save collection -> MUST BE REJECTED.
