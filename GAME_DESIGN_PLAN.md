# Ledger Quest: Gameplay Depth Plan

## Context
Ledger Quest (`~/Desktop/Ledger Quest/`, plain HTML and JS, about 5,300 lines, no engine) has four finished chapters and a neon dark fantasy look. Today the only gameplay is walk, talk, and answer a multiple-choice question. Chandler wants an adventure his friends enjoy: things to do, a story thread, and money and items that matter. This plan turns the approved direction into a phased build that starts with one complete slice in Paystub Village.

## Approved direction (Chandler, Nov 11)
| Decision | Answer |
|---|---|
| Puzzles | Mix: about half tax-rule puzzles, half classic adventure puzzles |
| Danger | Mix of real-time combat and avoidance |
| Story spine | The Torn Ledger |
| Extras | Shift work, boss movement phase, villager consequences, the Back Office |
| Core | Puzzle rooms, usable tools, fair economy |

## What the code has today (verified)
- Verbs: move, Talk (`world.interact`), menu. No Use key. Keys live in `KEYMAP` in `engine.js`.
- Every challenge is `LQ.ask` multiple choice: quests, tips, `audit.js`, `battle.js`.
- Maps are `LQ.newMap` tile grids. Entities have `use`, `pick`, `draw`, `solid`. No interiors, pushables, switches, hazards, or enemies. Barriers clear by quest number through `world.clear`.
- Gear: 20 items in `economy.js`. Only `ledger`, `abacus`, `spyglass`, and `rod` act in the world.
- Reusable: `fx.js` light pass, `world.burst`, `world.clear`, `LQ.script`, `state.flags`, `st.tips`, `finderStatus`, the reachability check in `tools/check.js`, and the mountain fog in `REGIONS.village.overlay`.

## Design

### 1. Field Kit (new `js/kit.js`)
- New **Use** key (E or C) uses the equipped tool. Q cycles tools. Tools also show in the Items tab.
- Existing items gain a world job, so nothing is rebuilt:

| Tool | Source today | World function |
|---|---|---|
| Truth Stamp (new) | Given free by the Mayor | Short melee swing. Also presses seal switches. |
| Standard Shield | Story item, quest 5 | Hold to block fog bolts |
| Bracket Compass | Story item, quest 6 | Reveals hidden rune paths and false walls |
| Charity Lantern | Bazaar gear, 200 coins | Lights dark rooms. Wisps keep out of the light. |
| 401(k) Step-Up Crampons | Summit gear | Cross ice (Phase 3) |
| One new tool each for Coast and Canyon | Phase 3 | Decided in that phase |

### 2. Hearts, combat, and avoidance (new `js/foes.js`)
- Four hearts in the overworld, drawn like the battle hearts. Tonics heal.
- At zero hearts you wake at the last Notary Lamp (checkpoint) and lose at most 20 coins. No progress is ever lost.
- **Myth Wisp:** cannot be hit. Touching one costs coins ("it sold you a bad idea"). Avoid it or carry the Lantern.
- **Scrap Imp:** chases you. Two Stamp hits. Drops coins.
- **Red Tape Crawler** (Phase 3): must be blocked with the Shield, then hit.
- Enemies live only in vaults, caves, and fog zones, never in town. Combat stays at one attack and three enemy types.

### 3. Rooms and puzzle parts (new `js/rooms.js`)
- Small interior maps entered through doors. The save keeps the parent region and door position, so the save format and `LQ.cleanSave` region list do not change.
- Parts: push block, pressure plate, seal switch, door, brazier, dark room flag, bolt trap. A room resets when you re-enter. Solved state is a flag.

### 4. Paystub Village slice content (new `js/vaults1.js`)
- **Bracket Vault** (tax rule, inside Bracket Mountain). Push income crates onto seven ledges, lowest first. Only the overflow reaches a higher ledge. The exit door opens when you stand on the ledge your last dollar landed on. Figures come from `taxdata.js` and the player's own career. It replaces the middle of Sage Altamira's lecture. Her chart stays as the recap.
- **Lantern Cave** (classic, north forest). Dark room. Light four braziers in the order shown by clues on village signs. Imps inside. Reward: a Ledger Page and a rare item.
- **Compass cache.** A hidden path the Compass reveals, guarded by wisps.
- **Three Ledger Pages:** vault, cave, and boss. Each one visibly repairs the village (fog thins, lamps relight, a shortcut bridge appears).

### 5. Fair economy (`economy.js`)
- Every tool needed to progress has three routes: buy, find, or rent for about 10 coins.
- Tools sell back at full price. Tax gear stays as it is.
- Consumables: Tonic (heal), Hint Token (a wandering merchant points at the next secret).
- New coin sources: imps, vault rewards, secrets, shift work. Prices and rewards get a tuning pass so rank and net worth do not inflate.

### 6. The Torn Ledger (story spine)
- The Great Ledger held the plain truth about money. Pages were torn out, and fog spreads where they are missing.
- Twelve pages, three per region. All twelve open the Back Office (changed Nov 13: every page can be recovered on any save, so nobody is locked out).
- Each boss drops an invoice from the same supplier. Found objects (flyers, an abandoned stall, a ledger stub) tell the story. No new long dialogue.
- The supplier's identity is settled in a short story pass at the start of Phase 4.

### 7. Extras
- **Shift work** (new `js/jobs.js`): a 30-second job game per career at the workplace. Pay arrives with withholding taken out by the player's own W-4 or estimate choice.
- **Boss movement phase** (`battle.js`): dodge myth bolts and grab a truth shard to unlock each answer. All existing myths stay.
- **Villager consequences:** three fooled villagers per region, fixed by an action, not a quiz. Fixed villagers reopen stalls, give discounts, or open shortcuts. Tracked in `st.flags`.
- **The Back Office:** hidden fifth area under the village and the finale.

## Phases
| Phase | Scope | Effort | Ends with |
|---|---|---|---|
| 0 | Switch the folder to `main`, pull, create branch `gameplay-depth`. Write `GAME_DESIGN_PLAN.md` in the game folder from this plan. | Low | Design doc committed |
| 1 | Kit, Use key, hearts and checkpoints, rooms and puzzle parts, wisps and imps, Bracket Vault, Lantern Cave, Compass cache, three pages, fair economy, checker updates | High | **Chandler playtests the village slice** |
| 2 | Shift work for the three careers, boss 1 movement phase, village consequences, tuning from playtest notes | Medium | Second playtest |
| 3 | Roll out to Coast, Canyon, Summit, one region per session: one tax vault, one classic puzzle, one new tool, pages, consequences, boss movement phase | High, three times | Playtest per region |
| 4 | Story pass, the Back Office, finale | High | Full-game playtest |
| 5 | Balance, polish, README, and vault notes update | Low | Merge to `main` |

**Cut line:** if combat does not feel good in the Phase 1 playtest, it drops to avoidance only before Phase 3. That is the one system I rated a weak fit, and the plan is built so removing it costs nothing else.

## Files
- **New:** `js/kit.js`, `js/foes.js`, `js/rooms.js`, `js/vaults1.js`, `js/jobs.js`, later `js/vaults2.js` to `vaults4.js` and `js/backoffice.js`, plus `GAME_DESIGN_PLAN.md`
- **Changed:** `engine.js` (Use and cycle keys, new save fields `hp`, `tool`, `cp` in `newState`, which `cleanSave` defaults for old saves), `world.js` (entity `step(dt)` hook, pushing, room enter and exit, dark overlay, hearts on the HUD), `ui.js` (tool slot, equip in Items), `economy.js` (tools, rent, buyback, consumables), `art.js` and `audio.js` (sprites and sounds), `battle.js` (movement phase), `chapter1.js` (Altamira's quest, Mayor gives the Stamp, sign clues), `index.html` (script order), `tools/check.js`

## Rules for every implementation session
- Read `GAME_DESIGN_PLAN.md` first. Do not reread the long history transcripts.
- No changes to tax math. Puzzle figures come from `taxdata.js`.
- Keep the neon palette (`LQ.NEON`) and the 320 by 180 buffer.
- Old saves must load.

## Verification
- `node tools/check.js .` after every change. Extend it to check: every room's door, parts, and exit are reachable, each puzzle has a valid solution from its reset state, and every progress-gating tool has a route that costs no coins.
- Test only the changed feature in the `ledger-quest` preview by setting state directly (quest number, flags, tool), not by playing through.
- Load a pre-change save and confirm it still works.
- Chandler's playtest at the end of each phase is the gate for the next one.

## Status
| Phase | State | Notes |
|---|---|---|
| 0 | Done | Branch `gameplay-depth`, this document |
| 1 | Done, playtested Nov 12 | Village slice. Chandler: combat is fun, the vault and cave are good as they are. Combat stays. |
| Opening | Done, playtested Nov 12 | The cottage and cellar prologue. Pace is right. See `INTRO_TUTORIAL_PLAN.md`. The cellar's great door is the Back Office entrance for Phase 4. |
| 2 | Built, waiting on Chandler's second playtest | Shift work, the Mythmonger movement phase, three fooled villagers. See the Phase 2 notes below. |
| 3 (activities) and 4 (finale) | Built Nov 13, waiting on a human playtest | Hands-on activities for Chapters 2 to 4, pages 4 to 12, the Back Office. See the Nov 13 notes below. The per-region vault, classic puzzle, new tool, and boss movement phase from the original Phase 3 are still not built. |
| 5 | Not started | |

## Phase 1 notes (Nov 11)
What was built
- `js/kit.js`: Use key (E or C), Q to switch, Truth Stamp, Standard Shield, Bracket Compass, Lantern, Tonic, hearts, fainting, the HUD, and the extra shop lines (tonic, lantern rental, rumors)
- `js/rooms.js`: rooms as rows of characters, plus crates, plates, doors, braziers, seals, plaques, Notary Lamps, pages, bolt traps, and darkness
- `js/foes.js`: Myth Wisp and Scrap Imp
- `js/vaults1.js`: the Bracket Vault, the Lantern Cave, the hidden cache, four rune stones, street lamps, the west bridge, and pages 1 to 3
- `tools/check.js`: village paths, the Compass gate, a crate solver for the vault for all three careers, the cave, and the free-route rule for tools

Where the build differs from the plan
- Checkpoints: a Notary Lamp stands outside each room door. Fainting puts you back outside that door, so no checkpoint field was added to the save. The only new save fields are `hp` and `tool`. Everything else is in `flags`.
- Buyback: no pure tool is sold yet (the Charity Lantern is tax gear), so full-price buyback waits for Phase 3.
- Hints: rumors are sold at the existing shops for now. The wandering merchant waits for Phase 3.
- The Lantern must be in hand (Q) to light a wide area and repel wisps. Holding the Stamp instead leaves you in a small circle of light. That trade-off is on purpose.

Page effects in the village
- Page 1 (vault): the mountain fog thins
- Page 2 (cave chest): the street lamps relight, and the Notary's Seal adds a fifth heart
- Page 3 (after the Mythmonger): the west bridge rises, and the Fog Invoice is found

Tested in the browser by setting state directly: vault from entry to page for the Nurse, cave puzzle wrong and right order, imp fight, bolt and shield, wisp toll with and without the lantern, compass reveal, tonic, fainting, old save loading, Altamira's recap. Not yet tested by hand: a real keyboard run of either room, the Mayor's new line, the lantern rental, the reset seal, the page 3 scene after the boss, and difficulty tuning.

## Phase 2 notes (Nov 12)
Playtest result: no tuning changes. Chandler gave no notes on the hidden cache or on anything broken.

What was built
- `js/battle.js`: a movement phase before every answer in the Mythmonger fight (`move: true` on the boss). Cross the field, dodge myth bolts, and grab the truth shard. A hit costs up to 8 coins and never a heart. Holding E with the Standard Shield blocks. After three hits the shard comes to the player. Bosses 2 to 4 are unchanged until Phase 3.
- `js/vaults1.js`: three fooled villagers, each fixed by an action and stored in `flags`.

| Villager | Action | Result | Flags |
|---|---|---|---|
| Rowan | Bracket Compass (E) while standing beside him | His cart leaves the east footbridge at (38, 14 to 15), a shortcut to the caves | `fixRowan` |
| Cook Basil | Truth Stamp on his shuttered stall west of the Work Hall, then carry the return to Registrar Juno | The stall reopens and sells tonics for 10 coins | `basilSeal`, `fixBasil` |
| Granny Maple | Hold a Lantern by the wisp on her porch | 10% off at the Saffron Bazaar | `fixMaple` |

- `js/jobs.js`: shift work at the board beside the Work Hall, open from quest 2. One 30-second game with a twist per career: call lights with urgent ones for the Nurse, matching orders for the Fast Food Worker, and a shelf to restock for the Small Business Owner.
- `tools/check.js` and `tools/play-check.js`: the footbridge is shut by the cart and open without it, shift pay stays inside its cap for every career and tax choice, and the headless run fixes all three villagers, works a shift, and steers through the boss movement phase.

Decisions and simplifications
- Shift pay is capped at half a payday and limited to two paid shifts per quest step. More shifts are practice with no pay.
- The shift stub holds back tax by the player's own W-4 or estimate choice. Shift coins never enter `LQ.fin`, so the tax return does not change. Shift pay is pocket money, not part of the year's wages.
- The Bazaar shows the discounted price on gear and supplies once Maple is helped. Gear retains its original value in the tax and savings model.
- Granny Maple's porch wisp tolls nobody, which keeps the rule that enemies stay out of town.
- A shift with zero points leaves both pay and paid attempts unchanged. Score targets for a full shift payout are 15 (Nurse), 7 (Fast Food Worker), and 11 (Owner). They were set from an automated player and need a human check.

Tested in the browser by setting state directly: the boss phase (a hit costs coins and no hearts, the shield blocks, the shard opens the answers), the whole Mythmonger fight through the page 3 scene and the west bridge, each villager fix and its reward, the footbridge crossing, one shift for each career, the stub against the tax choice, and the third shift paying nothing. Not tested: a person playing by hand for feel, and how the job game and stub look at full size.

Questions for the second playtest
- Does the movement phase drag? It runs before every answer, seven or eight times. The fix is to shorten it or run it on every other myth.
- Do the three job games feel different enough, and is the full payout too easy or too hard to reach?
- Is the east footbridge a useful shortcut, and are the three villagers easy to find without the rumor?


## Hands-on pass and finale notes (Nov 13)
What was built
- `js/depth.js`: one shared activity board, three activities, and Ledger Pages 4 to 12.

| Chapter | Activity | Replaces | Figures come from |
|---|---|---|---|
| 2, Assessor Tallow | Sort each receipt into ITEMIZE, CREDIT, or LEAVE OUT. The ITEMIZED shield updates on every move. Then pick the larger shield. | The one-shot "which do you carry" quiz and its correction fee | `LQ.fin2` |
| 3, Tallyman Brick | Sort each slip into IN FULL, HALF, or LEAVE OUT, then fill a tax jar in $500 steps. Money earned, job costs, profit, other spending, tax jar, and cash left are separate lines. | The client lunch question, the net profit quiz, and its correction fee | `LQ.fin3`, `LQ.SLIPS` |
| 4, Timekeeper Frost | Move the sale day along a clock to the first long-term day, then lower an example price until waiting comes out behind. The example is labeled EXAMPLE ONLY. The real choice and its outcome (the price held) are unchanged. | The "how long must you hold" question | `LQ.trial4` |

- A wrong check marks the row red, explains it in one or two sentences, and the player moves that one row. Nothing is replayed and no coins are lost. Each activity scores once, like a first-try question.
- Pages: 4, 7, 10 come from the activities. 5, 8, 11 come from the three later bosses, each with a fog invoice. 6, 9, 12 come from the three later filings.
- Older saves: milestone pages arrive by themselves the first time the hero stands still in any region. Activity pages are earned by talking to Tallow, Brick, or Frost again. Chapter starters also receive the village's three pages (`flags.starter`).
- Once the story is finished, the quest tracker names the next missing page with an action and a place, then points to the cellar.
- `js/backoffice.js`: the room behind the tall cellar door. Three valves to stamp (a crate and rune, an imp, a lane of fog bolts), the inner gate, Clerk Vell, Head Clerk Murk, and the Standing Order on the Fog Press. Stamping it is the last action. Valve progress is saved in `flags.bo1` to `bo3`, so a faint or a reset never undoes a valve.
- Story answers: Head Clerk Quillon Murk ordered the twelve plainest pages torn out and sold the confusion as fog. Vell tore them out, scattered them instead of burning them, and sealed himself in with the press. Invoices 2 to 4 reveal the cellar, the Ledger office seal, and Murk's signature in turn.
- `js/jobs.js`: the first shift offers an untimed practice (three tasks, no clock, no pay, Esc to leave).
- `js/ui.js`: a document may have its own `update`, which gets the keys while no dialogue is open.
- Fog on Bracket Mountain clears fully once the Ledger is whole (`flags.ledgerDone`).

Checks
- `tools/check.js`: sorted receipts equal the return's itemized figure, sorted slips equal Schedule C, the tax jar can reach the bill, the example price drop can outweigh the saving for every career and gig, page recovery lists, and Back Office reachability before and after each lock.
- `tools/play-check.js`: every activity phase is handed in wrong once and then right, an older finished save recovers its pages, the tall door opens, a faint keeps a shut valve, and the final stamp ends the story. Also the practice shift.

Needs a human playtest
- Feel and pacing of the three boards with a real keyboard, and whether the instructions read clearly to a first-time learner.
- The Back Office with real movement: the bolt lane timing, the imp, and the crate push.
- Reading size on a phone-width window. The whole screen scales down evenly, so nothing overlaps, but the text gets small.
- The cellar's tall door sits near the top HUD. It works, but the view is tight.


## Adventure pass, batch 1 notes (Nov 13)
Scope: active gameplay in Chapters 2 to 4 and the health loop. Not committed. Tax math is unchanged.

What was built
- `js/battle.js`: every boss now has its own movement phase before each answer, set by `move` on the boss config. Each one warns before it hurts, and the pickup comes to the player after three hits or the time limit.

| Boss | `move` | Pattern | Shield |
|---|---|---|---|
| Baron Befuddle | `bolts` | Myth bolts along lanes (unchanged) | Blocks |
| Captain Loophole | `beam` | The lighthouse lamp marks a strip of sand, then floods it. Step out of the strip. | No |
| Sidewinder Slick | `devils` | Dust devils bounce around the field while the player collects three cash slips | No |
| Glint | `fire` | The dragon flies to a lane and breathes fire along it, and drops hot tips on a marked spot | Blocks the fire |

- The myth for the round stays on screen during the movement phase, so the dodge and the question are one beat.
- Hearts are shared. The fight uses the same hearts as the world (`state.hp`), in quarter steps. A dodge hit costs a quarter heart (it used to cost coins), a wrong answer costs half a heart, and at zero the player gets two hearts back and the fight goes on. Whatever is left carries into the world and is saved.
- `js/kit.js`: `kit.heart` draws partial hearts for both HUDs. Shops offer a Hot meal (8 coins, fills every heart) when the player is hurt, and Sit and rest (free, back to two hearts) when below two. Tonics are unchanged.
- `js/adventure.js` (new): a free Notary Lamp beside each later boss (`LQ.ADV.lamps`), and Slick's Stash, a small dungeon in the red rock south-west of the creek bridge in Hustle Canyon. Cross a fog-bolt passage, then stamp the three strongboxes that hold income (cash fares with no form, online sales under the 1099-K threshold, tips) and leave the birthday gift. Stamping the gift springs a Scrap Imp. Reward: 40 coins and a tonic. It is optional, open from the start of Chapter 3, and has a rumor at the Trading Post. Flags: `stash3`, `stash3Chest`, `stashSeen`, `stashImp`.
- `js/art.js`: Glint is redrawn as a dragon (beating wings, long neck, horned head with a snout, spade tail). In the fight Glint flies to the lane it is about to burn. Loophole drifts and Slick shivers.
- `js/audio.js`: three sounds, `warn`, `beam`, `fire`. `js/engine.js`: saved hearts keep quarter steps.

Checks
- `tools/check.js`: the stash door, each lamp, and each boss approach are reachable with the lamps standing; the stash has three income boxes and one that is not.
- `tools/play-check.js`: all four movement patterns run, the stash is solved with one wrong box first, the chest pays once, boss damage lands in quarter hearts and is saved, the meal needs coins, the free rest and the Gulch lamp work with an empty purse. Passes for nurse, food, and owner.
- Seen in the browser by setting state directly: the lighthouse, dust devil, and dragon phases, the quarter heart on both HUDs, and the stash room.

Needs a human playtest
- Difficulty and feel of the three new phases with real hands. Warn times start at 0.9 seconds and tighten to 0.6.
- Whether half a heart per wrong answer and a two-heart second wind feel fair.
- Loophole and Slick keep their old sprites. Only Glint was redrawn.

Still open from the Nov 13 brief
- Field Kit page (three equipped tools, store and swap, finder toggle), storefronts, enterable houses
- Playable side-income activity, earned/spent/kept/reported summary, easier stock discovery, the Chapter 4 hold-versus-sell and taxable-versus-Roth comparison with official-source wording
- NPC tips and money problems, one optional finance quest per chapter (Chapter 3 has the stash), music cues, narration and cutscene prototype
- Chapters 5 and 6 are proposed only, not built


## Adventure pass, batch 2 notes (Nov 13)
Scope: tools and exploration. Not committed. At Chandler's request this batch had no playthrough and no browser check. Only syntax and `tools/check.js` were run. `tools/play-check.js` was not run and may need its tool steps updated for the three-slot rule.

What was built
- `js/kit.js`: three tools in hand at most. Q cycles the tools in hand and E uses the active one. The in-hand list is `flags.kitEq` and the sorted list is `flags.kitSeen` (comma-separated ids), so old saves load and get their first three tools in hand.
- A new tool goes in hand if there is room. Otherwise a toast says it went into the kit.
- Recovery: `kit.need(id)` puts a stored tool in hand and stores the one not being held. The Lantern Cave door calls it, and any code that sets `state.tool` to a stored tool gets the same swap.
- The Field Kit page is the sixth menu tab, Kit, also opened with K. It shows the three hand slots, every tool with "hand 1 to 3" or "stored", and a panel with what the tool does, its upgrades, and the free route to get it back. Enter stores or equips. With three in hand, Enter on a stored tool asks which one to store.
- Upgrades shown are the real ones only: the lantern tiers (rental, Old Lantern, Charity Lantern) and the fifth heart. Other tools say they are at full strength.
- Finders (Receipt Spyglass, Dowsing Rod) are rows on the same page. Enter switches hints off and on (`flags.off_spyglass`, `flags.off_rod`). The count stays on the HUD; only the direction hint hides.
- `js/adventure.js`: a coin banner beside every shopkeeper and a ticker board behind every broker, in all four regions. Both are decoration and do not block movement.
- Three enterable houses, entered at the right-hand door tile. Each resets on entry and pays once.

| Region | Building | Room | Puzzle | Reward |
|---|---|---|---|---|
| Shelter Coast | `seacot` | `house2`, your sea cottage | Push the savings crate onto the rune (pay yourself first) | 30 coins, a tonic |
| Hustle Canyon | `c3depot` | `house3`, the depot back room | Stamp the bill that must be paid first, rent or boots (needs before wants) | 30 coins |
| Summit of Gains | `c4lodge` | `house4`, your lodge | Light the hearth: a free full rest, and the frozen trunk opens | 20 coins, a tonic |

Needs checking by hand
- Everything in this batch. In particular: the Kit tab layout and the swap flow, the six tabs fitting the menu bar, each house door being reachable and its puzzle opening the alcove, and where the banners and ticker boards sit relative to the stalls.
- Paystub Village has no enterable house beyond the player's cottage.


## Adventure pass, batch 3 notes (Nov 13)
Scope: money players earn and see. Not committed. No playthrough and no browser check, at Chandler's request. Only syntax and `tools/check.js` were run. No tax math changed.

What was built (`js/money.js`, new)
- Gig run: a board at (26, 22) just south of the Hustle Canyon plaza, open once a gig is picked. It reuses the shift-work engine with the sell-and-restock game, relabeled per gig (parcels, pots, letters). 30 seconds, two paid runs per quest step, the rest are practice.
- After a paid run a stub shows Earned, Spent on the job (a quarter of earned), Profit, Tax jar (self-employment tax on the profit, from `taxdata.js`), and Kept. The cap is 40 coins earned per run. Kept coins go to the purse.
- Money trail: "See my money trail" on the board puts the practice totals (flags `gE`, `gC`, `gJ`, `gK`, `gR`) beside the real Schedule C figures from `LQ.fin3`, with a Reported line that turns to "Yes, on Schedule C" after filing. Both the stub and the trail say the runs are practice and never change the return.
- Stocks: the first time the hero comes within about four tiles of a broker, two toasts say how to buy, hold, and sell and where holdings show (`flags.stockTold`). The Broker tab footer now says where to trade.
- Chapter 4 compare board: three cards after Timekeeper Frost's sale clock, then one unscored question. Cards: hold or sell, selling at a loss, taxable brokerage or Roth IRA. Each card carries a PRACTICE line and a REAL line naming what does reach the return.

Tax wording and sources (checked Nov 13)
- Holding period, short-term taxed as ordinary income, the $3,000 loss limit and carryforward: IRS Topic 409, https://www.irs.gov/taxtopics/tc409
- Roth IRA: contributions not deductible, qualified distributions tax-free, possible tax and a 10% additional tax on early withdrawals: https://www.irs.gov/retirement-plans/roth-iras and https://www.irs.gov/retirement-plans/traditional-and-roth-iras
- The cards add no new wash sale wording. Publication 550 was too long to load to the wash sale section, so the existing wash sale text was not rechecked.

Simplifications
- The gig run's job cost is a flat quarter of what is earned, and the tax jar is self-employment tax only, with no income tax share.
- Gig run coins are pocket money, like shift coins. The return uses the story figures.

Needs checking by hand
- Everything in this batch: the gig run and its labels, the stub and trail layouts, the board position, the toasts, and the three cards. `tools/play-check.js` has not been run since batch 1.


## Adventure pass, batch 4 notes (Nov 13)
Scope: world and presentation. Not committed. No playthrough and no browser check, at Chandler's request. Only syntax and `tools/check.js` were run.

What was built (`js/flavor.js`, new, loaded last before the title)
- A tip or a funny money problem for all 77 villagers (`LQ.QUIPS`). Each is one line, said once, after the villager's usual business, and remembered in `flags.quip_<chapter>_<id>`. `tools/check.js` fails if a villager has none.
- Music cues in `js/audio.js`: `boss2` (Loophole, a minor shanty), `boss3` (Slick, a gallop), `boss4` (Glint, heavy and low), `puzzle` (Bracket Vault and Slick's Stash), `home` (the cottage and the three houses), and `story` (the cutscene). The Mythmonger keeps `battle`, and each chapter keeps its own town track. A boss config can name its track with `music`.
- Narration prototype: N switches spoken narration on and off. It uses the browser's built-in speech voice, reads cutscene captions only, and is saved outside the game save. If the browser has no speech voice, a toast says so and captions carry on. Villager dialogue stays text.
- One cutscene: the Torn Ledger so far, four panels, shown the first time the hero reaches Shelter Coast (`flags.cut2`). Captions are always on. Enter turns the page, Esc skips the whole scene, and a page turns by itself after a pause.

Optional finance quests, one per chapter (plan)
| Chapter | Quest | Lesson | Reward | State |
|---|---|---|---|---|
| 1 | Granny Maple's jar: bring her three coins found around the village, and she shows the jar she has filled one coin in ten for sixty years | Pay yourself first, small and steady | 30 coins and a tonic | Planned, not built |
| 2 | The sea cottage cupboard: push the savings crate onto its spot before anything else | Pay yourself first | 30 coins and a tonic | Built in batch 2 as `house2` |
| 3 | Slick's Stash: stamp the strongboxes that hold income | All income counts, with or without a form | 40 coins and a tonic | Built in batch 1 as `stash3` |
| 4 | The lodge hearth today. Planned upgrade: Index Ada asks the hero to sort six stock tips into "a plan" and "a guess" | Diversify, and ignore hot tips | 20 coins and a tonic today. A fund pin that cuts broker fees if upgraded | Hearth built in batch 2 as `house4`. Sorting quest planned |

None of the four appears in the quest tracker yet. A tracker line and a journal entry per optional quest is a small follow-up.

Needs checking by hand
- Everything in this batch: where each line lands after a villager's own dialogue, the six music cues by ear, the narration voice and its timing, and the cutscene art and captions.
- `tools/play-check.js` has not been run since batch 1. Batches 2 to 4 changed tool cycling, Chapter 4's sale clock, villager dialogue, and the arrival at Shelter Coast, so expect it to need updates.

