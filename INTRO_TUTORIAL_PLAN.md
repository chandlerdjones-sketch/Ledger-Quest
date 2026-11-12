# Ledger Quest: Opening and Tutorial Plan ("Under the Floorboards")

## Context
A new game today is three lines of text, the career cards, and then a conversation with the Mayor. Nothing sets up the world, and the tools, crates, enemies, and hearts added in Phase 1 are never taught. Chandler wants an opening that reads like the first chapter of an indie adventure and teaches by doing. This plan adds a playable prologue in the player's own cottage and the cellar beneath it, then hands off to Chapter 1 unchanged.

## Approved direction (Chandler, Nov 11)
| Decision | Answer |
|---|---|
| Concept | C: Under the Floorboards |
| Identity | Light personal tie. The cottage came cheap because its last tenant, a clerk of the Great Ledger, vanished. The player is not related to him. |
| Tone | Eerie in the cottage and cellar, warm and dry once the Mayor appears |

## Lore kept and lore added
- Kept: the newcomer with a new job, the Ledgerlands, the fog, the Torn Ledger, twelve pages, the unnamed supplier.
- Added (small): the last tenant, Clerk Osric Vell. The cellar is the old foundation of a Ledger records office. Its sealed door, with twelve empty page slots, is the entrance to the Back Office from the approved finale. Nothing about the supplier is revealed.
- Changed: the Truth Stamp is found in the cellar. The Mayor recognizes it instead of handing it over. Players who skip the opening still get it from her.

## The first 12 minutes
| Time | Beat | Player does | Prompt shown | Teaches | Pass condition |
|---|---|---|---|---|---|
| 0:00 | Two lines over black: the Ledgerlands, and a cottage that rents for almost nothing. Choice: play or skip the opening. | Picks one | none | Choices | A choice is made |
| 0:20 | Wake in the cottage at night. One lamp. Rain of motes at the window. A dead clerk's coat still hangs by the door. | Walks | "Arrows or WASD: move" | Movement | Player moves 3 tiles |
| 0:45 | A letter glows on the table. | Reads it | "Space: read" | Interact | Letter opened |
| 1:00 | The letter is the job offer. It becomes the existing career card screen. A second page from the landlord explains the low rent: the last tenant, Clerk Vell, left one night without his deposit. | Picks a career | none | Choices, identity | Career set |
| 2:00 | A thump under the floor. The coin purse on the shelf is gone. Scratch marks lead to a crate. | Pushes the crate off the trapdoor | "Walk into the crate to push it" | Pushing | Trapdoor tile clear |
| 2:45 | Cellar. Cold stone, cyan runes, the game's first banner: THE OLD RECORDS CELLAR. A Notary Lamp by the stairs. | Talks to the lamp | "Space: use the lamp" | Checkpoints, hearts | Optional |
| 3:30 | A pedestal holds the Truth Stamp. A tablet: "For an honest mark. O.V." | Takes it | "Got: Truth Stamp. E: use" then "J: see your items" | Collecting, the J menu | Stamp owned |
| 4:15 | A gate with a gold wall seal. | Strikes the seal | "Face the seal and press E" | Using a tool | Gate opens |
| 5:00 | The Scrap Imp, chewing the purse. | Fights it (two hits) | "E: swing. Step back when it lunges" | Combat, hearts | Imp down, purse and coins recovered |
| 6:00 | A side passage with one Myth Wisp over a few loose coins. | Dodges it, or pays its toll | "Wisps cannot be struck. Slip past." | Avoidance, risk and reward | Optional |
| 7:00 | The far wall: a great sealed door with twelve empty page slots and one line cut in stone: "Twelve pages. Twelve truths. Sealed until they come home." Vell's desk has an unfinished entry that stops mid-word. | Reads both | none | The central mystery | Door read |
| 7:45 | A knock from above. "Hello? It is Mayor Marigold. I heard a crash." | Climbs out and leaves the cottage | Quest tracker appears | Quests and the pointer | Player is in the village |
| 8:30 | Paystub Village banner. Warm lamps, music change. The quest arrow points to the Mayor. | Walks to her | none | Navigation | Talks to the Mayor |
| 9:00 | The Mayor: recognizes the Stamp, names the fog, gives 50 coins, and points out Merchant Saffron and Foreman Brannock. Five short lines. | Listens | none | Goal, shops | Quest 1 begins |
| 9:30 to 12:00 | Free play: an optional tonic at the Bazaar, then Brannock at the Work Hall, as today. | Explores | "Saffron sells tonics. They mend hearts." (once) | Spending coins | Chapter 1 continues |

No stretch without control is longer than about 20 seconds.

## Failure handling
| Situation | What happens |
|---|---|
| Hearts reach zero in the cellar | Wake at the cellar's Notary Lamp with full hearts. No coins are lost during the opening. The imp resets. |
| Wisp touched | Normal toll of up to 12 coins, or nothing if the purse is empty |
| Crate pushed the wrong way | The room is built so every push still clears the trapdoor. The room also resets on re-entry. |
| Quit and reload mid-opening | The save records the opening stage. Loading returns the player to the cottage at that stage with everything earned so far. |
| Player skips | Career cards as today, then the village. The Mayor gives the Stamp. The cottage and cellar can still be visited, minus the purse scene. |
| Start at Chapter 2, 3, or 4 | The opening is skipped automatically |
| Old saves | Unaffected. They are treated as having finished the opening. |

## How it is built
- **New `js/intro.js`:** two rooms on the Phase 1 room system (`LQ.ROOMS.cottage1`, `LQ.ROOMS.cellar1`), the stage logic, the prompts, and the new props (bed, table, letter, trapdoor, pedestal, desk, great door), all drawn in code like the Phase 1 parts.
- **Reused as is:** `LQ.parts` block, seal, door, plaque, lamp (`js/rooms.js`), `LQ.foes.imp` and `wisp` (`js/foes.js`), `LQ.kit` (`js/kit.js`), `LQ.say`, `LQ.choose`, `ui.showBanner`, the existing career card screen, the `mountain` music track, and the `rumble` sound.
- **Stage tracking:** `flags.intro` holds the stage (cottage, career chosen, stamp taken, purse back, done). No new save fields.
- **Small edits:**
  - `js/title.js`: the play or skip choice, start a new game in the cottage, resume a save at its stage, and expose the career card screen as `LQ.careerSelect`
  - `js/world.js`: one contextual prompt line that replaces the fixed hint bar, and a `home` option so fainting in the opening wakes you at the cellar lamp without a coin loss
  - `js/chapter1.js`: the Mayor's lines change when the Stamp is already owned, and her greeting gets shorter
  - `js/vaults1.js`: the cottage door becomes an entrance, so home and the cellar stay visitable
  - `index.html`, `tools/check.js`, `README.md`
- **Not changed:** tax math, the career data, Chapter 1's quests after the Mayor, and the save format.

## Implementation checklist
0. Commit the Phase 1 code on `gameplay-depth` (it is still uncommitted), then save this plan as `INTRO_TUTORIAL_PLAN.md` in the game folder and commit it
1. Contextual prompt line in `world.js`
2. Cottage room, props, letter, and career hand-off
3. Cellar room: lamp, pedestal and Stamp, seal gate, imp and purse, wisp passage, great door, desk
4. Stage tracking, resume on load, and the play or skip choice in `title.js`
5. The knock, the exit to the village, and the Mayor's revised lines
6. Cottage door as a permanent entrance
7. Checker additions and README controls
8. Browser verification, then update `GAME_DESIGN_PLAN.md` status and the vault project note

## Acceptance criteria
- A new game gives the player control within 30 seconds
- Every row of the timeline can be completed with only the keys shown in its prompt
- Each prompt disappears once its action is done and never blocks play
- Quitting at any stage and reloading returns to that stage with nothing lost
- Skipping reaches the village with a career, the Stamp from the Mayor, and Chapter 1 intact
- Fainting in the cellar loses no coins and no progress
- A save made before this change loads straight into the village as before
- No console errors, and the cottage and cellar read clearly at the game's normal brightness
- `node tools/check.js .` passes with the new rooms included

## Verification
- `node tools/check.js .` after each step. New checks: both rooms are at least screen size, the crate can always be pushed off the trapdoor, every part and the exit are reachable, and the great door cannot be passed.
- In the `ledger-quest` preview, test each stage by setting `flags.intro` directly, plus one real keyboard pass through the whole opening, since this is the first thing every player sees.
- Reload at each stage to confirm resume. Load a Phase 1 era save to confirm it skips the opening.

## Risks
- The tutorial teaches combat, which Chandler has not playtested. The imp beat is one function, so if combat is cut it becomes a chase that ends when the imp is cornered.
- Opening pace depends on feel that only a hand playtest can judge. Expect one tuning pass.

## Status (Nov 11)
Built and committed on `gameplay-depth`. Waiting on Chandler's playtest.

Where the build differs from the plan
- The Mayor's knock comes after the player has read the great door and turned back, so nobody can leave without seeing it.
- The quest tracker follows the opening ("Read the letter on the table", "Find whatever took your coin purse") until the knock.
- Scrap Imps now walk the shortest route to the player, so walls and doorways no longer trap them. This also applies in the Lantern Cave.
- The cellar imp pays its coins once, even if the player reloads and fights it again.
- The tonic tip is one line in the Mayor's speech, not a separate prompt.

Tested
- One keyboard run from the title screen through every beat to the Mayor and quest 1, including the J menu
- Reloading part way through resumes in the cottage at the right stage
- Skipping reaches the village with a career, and the Mayor hands over the Stamp
- Fainting in the cellar costs no coins and wakes the player at the stairs
- A save with no opening stage loads straight into the village
- The wisp toll, and `node tools/check.js .`

Not tested: a person playing it by hand for pace and difficulty. Note for testing: the Browser pane pauses the game while hidden.

Note on coins: finishing the Mayor's quest pays the usual payday on top of her 50 coins, so a Nurse leaves the opening with about 160.
