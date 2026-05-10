export type RankedStock = {
  ticker: string;
  mentions: number;
};

const SUBREDDITS = ["wallstreetbets", "stocks", "investing"];

const COMMON_WORDS = new Set([
  "THE", "AND", "FOR", "ARE", "BUT", "NOT", "YOU", "ALL", "NEW", "NOW",
  "CEO", "USA", "ATH", "IPO", "LOL", "THIS", "THAT", "WITH", "HOLD",
  "SELL", "BUY", "MOON", "PUMP", "DUMP", "YOLO", "GAIN", "LOSS",
  "ETF", "USD", "IRS", "GDP", "AI", "DD"
]);

function extractTickers(text: string): string[] {
  const matches = text.toUpperCase().match(/\$?[A-Z]{2,5}\b/g) || [];

  return matches
    .map((ticker) => ticker.replace("$", ""))
    .filter((ticker) => !COMMON_WORDS.has(ticker));
}

async function fetchRedditJson(url: string) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 reddit-stock-agent",
      "Accept": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${text.slice(0, 200)}`);
  }

  return res.json();
}

export async function getTopRedditStocks(): Promise<RankedStock[]> {
  const counts: Record<string, number> = {};

  for (const subreddit of SUBREDDITS) {
    const urls = [
      `https://www.reddit.com/r/${subreddit}/top.json?t=week&limit=100`,
      `https://www.reddit.com/r/${subreddit}/hot.json?limit=100`,
    ];

    for (const url of urls) {
      const json = await fetchRedditJson(url);
      const posts = json?.data?.children || [];

      for (const post of posts) {
        const text = `${post.data?.title || ""} ${post.data?.selftext || ""}`;
        const tickers = extractTickers(text);

        for (const ticker of tickers) {
          counts[ticker] = (counts[ticker] || 0) + 1;
        }
      }
    }
  }

  return Object.entries(counts)
    .map(([ticker, mentions]) => ({ ticker, mentions }))
    .sort((a, b) => b.mentions - a.mentions)
    .slice(0, 10);
}