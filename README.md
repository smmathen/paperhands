# Paperhands

A local gut-check paper trading journal. Log hypothetical stock and ETF buys/sells, track what your portfolio would be worth, and see whether trusting your gut would have made money.

Built with Next.js, SQLite, Finnhub delayed quotes, and [Neobrutalism components](https://www.neobrutalism.dev/docs/installation) (dark theme).

## Features

- Log gut buys with ticker + dollar amount (filled at delayed market price)
- Sell full positions with a required note on every trade
- Dashboard with account value, cash, holdings, unrealized P&L, and equity curve
- Trade history log
- Reset account back to $10,000
- Runs entirely on your machine — data stays in `data/paperhands.db`

## Quick start

```bash
git clone <your-repo-url>
cd paperhands
npm install
cp .env.example .env.local
```

Add your free [Finnhub API key](https://finnhub.io/) to `.env.local`:

```
FINNHUB_API_KEY=your_key_here
```

Then:

```bash
npm run db:push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

That's it — no cloud database, no deployment, no login.

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `FINNHUB_API_KEY` | Yes | Free API key from [finnhub.io](https://finnhub.io/) for delayed US stock/ETF quotes |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Run production server locally |
| `npm run db:push` | Create/update SQLite schema |
| `npm run db:generate` | Generate migration files |
| `npm run db:studio` | Open Drizzle Studio |

## Data storage

Your portfolio lives in `data/paperhands.db` (gitignored). Each clone of the repo gets its own isolated database. Delete that file to start completely fresh, or use the in-app **Reset Account** button.

## Paper trading rules

- Starting balance: **$10,000**
- Assets: US stocks and ETFs
- Buys: dollar amount at current delayed quote when submitted
- Sells: full position only
- Notes: required on every trade (min 3 characters)
- Cash rules: strict — trades rejected if insufficient cash or shares

## Future: deploy

This app is local-first today. If you later want to host it publicly, you'd need to re-add auth, pick a hosted database, and configure deployment — but none of that is required to use Paperhands now.
