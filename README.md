# Ledger Quest

A retro adventure game that teaches how US federal income taxes work. You walk through the Ledgerlands, talk to the people who live there, and every quest teaches one real step of doing your taxes.

## Play

Open the game link in a browser on a computer with a keyboard. There is nothing to install.

| Key | Action |
|---|---|
| Arrow keys or WASD | Move |
| Space or Enter | Talk, confirm |
| J or Tab | Menu: quests, journal, items, map, broker |
| Esc | Back |
| M | Sound on or off |

Progress saves in your browser. The title screen has three save slots, and each slot can be saved to a backup file and loaded on another computer.

## What is in the game

- **Chapter 1, Paystub Village.** The W-4 and withholding, reading a paystub, the W-2, filing status, the standard deduction, marginal tax brackets, and filing a return.
- **Chapter 2, Shelter Coast.** Buying a home, getting married, and a child joining the family. Mortgage interest, filing jointly, the Child Tax Credit, the child care credit, and whether to itemize.
- Three careers that change the numbers: Nurse, Small Business Owner, and Fast Food Worker.
- Surprise audits, a market that sells tax advantages, and a brokerage account with stocks from the game world.

Chapters 3 and 4 are planned.

## Accuracy

The game uses US federal figures for tax year 2026. Every figure lives in `js/taxdata.js` with a link to its source, mostly IRS Revenue Procedure 2025-32 and IRS.gov. Some rules are simplified so the game stays playable, and the game says so where it matters.

This is an educational game. It is not tax advice.

## Run it on your own computer

The game is plain HTML and JavaScript with no build step. Serve the folder with any static web server, for example:

```bash
python3 -m http.server 8765
```

Then open `http://localhost:8765` in a browser.
