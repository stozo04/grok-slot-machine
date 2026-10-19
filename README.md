
# NEURAL JACKPOT: The AI Wars
Simulated-money 3D slot machine. No real purchases, deposits, or withdrawals.
## Run
```bash
npm install
npm run dev
```
Open the Vite URL. Deposit virtual credits, pick denomination ($1/$5/$10) and multiplier (1x/5x/10x), total bet = denomination × multiplier × 20 lines, then SPIN (or Space).
## Verify
```bash
npm test          # reel strips, seeded spin, paylines, RTP band
npm run simulate  # 1,000,000-spin empirical RTP vs theoretical
npm run build
```
## Probability model
Explicit 100-stop virtual reel strips built from weights BLANK 40, GROK 25, CHATGPT 15, MUSE 10, ANTHROPIC 7, GEMINI 3, differently ordered per reel. Stops sampled uniformly (crypto RNG in play, seeded RNG in tests). Outcomes are decided before animation; 20 fixed paylines pay left-to-right for 3/4/5 of a kind, multipliers × bet per line in `src/engine/config.ts`. Odds never depend on balance, bet, or prior spins.
## Assets
User-supplied logos live in `assets/` at project root and `src/assets/` in the app (Grok, ChatGPT, Muse, Anthropic, Gemini). Replace `src/assets/muse.webp` to reconfigure the Muse symbol. Logos belong to their respective owners.
