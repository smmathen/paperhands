type Quote = {
  symbol: string;
  price: number;
  fetchedAt: Date;
};

const cache = new Map<string, { quote: Quote; expiresAt: number }>();
const CACHE_TTL_MS = 60_000;

function getApiKey() {
  const key = process.env.FINNHUB_API_KEY;
  if (!key) {
    throw new Error("FINNHUB_API_KEY is not configured");
  }
  return key;
}

export function normalizeSymbol(symbol: string): string {
  return symbol.trim().toUpperCase();
}

export async function fetchQuote(symbol: string): Promise<Quote> {
  const normalized = normalizeSymbol(symbol);
  if (!/^[A-Z]{1,5}$/.test(normalized)) {
    throw new Error("Invalid ticker symbol");
  }

  const cached = cache.get(normalized);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.quote;
  }

  const url = new URL("https://finnhub.io/api/v1/quote");
  url.searchParams.set("symbol", normalized);
  url.searchParams.set("token", getApiKey());

  const response = await fetch(url.toString(), {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch quote for ${normalized}`);
  }

  const data = (await response.json()) as {
    c?: number;
    pc?: number;
  };

  const price = data.c && data.c > 0 ? data.c : data.pc;
  if (!price || price <= 0) {
    throw new Error(`No valid price available for ${normalized}`);
  }

  const quote: Quote = {
    symbol: normalized,
    price,
    fetchedAt: new Date(),
  };

  cache.set(normalized, {
    quote,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });

  return quote;
}

export async function fetchQuotes(
  symbols: string[],
): Promise<Record<string, Quote>> {
  const unique = [...new Set(symbols.map(normalizeSymbol))];
  const entries = await Promise.all(
    unique.map(async (symbol) => {
      try {
        const quote = await fetchQuote(symbol);
        return [symbol, quote] as const;
      } catch {
        return null;
      }
    }),
  );

  return Object.fromEntries(
    entries.filter((entry): entry is [string, Quote] => entry !== null),
  );
}
