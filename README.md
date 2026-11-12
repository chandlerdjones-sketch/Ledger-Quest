# Ledger Quest

A retro adventure game that teaches how US federal income taxes work. You walk through the Ledgerlands, talk to the people who live there, and every quest teaches one real step of doing your taxes.

## Play

Open the game link in a browser on a computer with a keyboard. There is nothing to install.

| Key | Action |
|---|---|
| Arrow keys or WASD | Move |
| Space or Enter | Talk, confirm |
| E or C | Use the tool in hand (hold it for the shield) |
| Q | Switch tools |
| J or Tab | Menu: quests, journal, items, map, broker |
| Esc | Back |
| M | Sound on or off |

A new game opens in your cottage and teaches the controls as you play. You can skip it. Progress saves in your browser. The title screen has three save slots, and each slot can be saved to a backup file and loaded on another computer.

In the J menu, use Left and Right to change tabs. Use Up and Down to select notes, items, gear, or stocks. Press Enter to read a selected note or item in full, then Esc to return to the list. The Broker tab shows where to buy or sell each stock. Speak to the broker at that exchange to trade.

## What is in the game

- **Chapter 1, Paystub Village.** The W-4 and withholding, reading a paystub, the W-2, filing status, the standard deduction, marginal tax brackets, and filing a return.
- **Chapter 2, Shelter Coast.** Buying a home, getting married, and a child joining the family. Mortgage interest, filing jointly, the Child Tax Credit, the child care credit, and whether to itemize.
- **Chapter 3, Hustle Canyon.** A side gig. Forms 1099-NEC and 1099-K, business expenses, Schedule C, self-employment tax, the business income deduction, and quarterly estimated payments.
- **Chapter 4, Summit of Gains.** Investing. Cost basis, inherited shares, short-term and long-term gains, dividends and interest, tax-loss harvesting, the wash sale rule, how gains stack on other income, and the main account types.
- Three careers that change the numbers: Nurse, Small Business Owner, and Fast Food Worker. Three side gigs do the same in Chapter 3.
- Surprise audits, a market that sells tax advantages, and a brokerage account with stocks from the game world.
- A new game can start at any chapter with a starter kit.

## Accuracy

The game uses US federal figures for tax year 2026. Every figure lives in `js/taxdata.js` with a link to its source, mostly IRS Revenue Procedure 2025-32 and IRS.gov. Some rules are simplified so the game stays playable, and the game says so where it matters.

This is an educational game. It is not tax advice.

## Run it on your own computer

The game is plain HTML and JavaScript with no build step. Serve the folder with any static web server, for example:

```bash
python3 -m http.server 8765
```

Then open `http://localhost:8765` in a browser.

## Check the game without playing it

`tools/check.js` loads the game's logic with no browser and checks the Chapter 3 and 4 tax math against a separate hand calculation, that every person, coin, chest, and exit on the newer maps can be reached, and that every quest, journal entry, and item is wired up.

```bash
node tools/check.js .
```
