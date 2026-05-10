const SUBREDDITS = ["wallstreetbets", "stocks", "investing"];

export type RankedStock = {
  ticker: string;
  mentions: number;
};

const COMMON_WORDS = new Set([
  "THE","AND","FOR","ARE","BUT","NOT","YOU","ALL","NEW","NOW","CEO","USA","ATH","IPO",
  "LOL","THIS","THAT","WITH","HOLD","SELL","BUY","MOON","PUMP","DUMP","YOLO","GAIN",
  "LOSS","ETF","USD","IRS","GDP","AI"
]);

type StockCount = Record<string, number>;

async function fetchPosts(subreddit: string, sort: "hot" | "top") {
  const url =
    sort === "hot"
      ? `https://www.reddit.com/r/${subreddit}/hot.json?limit=100`
      : `https://www.reddit.com/r/${subreddit}/top.json?t=week&limit=100`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "reddit-stock-agent/1.0",
    },
    cache: "no-store",
  });

  if (!res.ok) return [];

  const json = await res.json();
  return json.data?.children || [];
}

function extractTickers(text: string): string[] {
  const matches = text.toUpperCase().match(/\b[A-Z]{2,5}\b/g) || [];

  return matches.filter(
    (ticker) =>
      !COMMON_WORDS.has(ticker) &&
      !ticker.startsWith("HTTP") &&
      !ticker.includes("EDIT")
  );
}

export async function getTopRedditStocks() {
  const counts: StockCount = {};

  for (const sub of SUBREDDITS) {
    for (const sort of ["hot", "top"] as const) {
      const posts = await fetchPosts(sub, sort);

      for (const post of posts) {
        const data = post.data;
        const text = `${data.title} ${data.selftext || ""}`;

        const tickers = extractTickers(text);

        for (const ticker of tickers) {
          counts[ticker] = (counts[ticker] || 0) + 1;
        }
      }
    }
  }

  const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return sorted.map(([ticker, mentions], index) => ({
    rank: index + 1,
    ticker,
    mentions,
    companyName: `${ticker} Corp.`,
    summary: `Popular on Reddit due to unusual discussion volume this week.`,
    catalyst: `Trending across WSB / Stocks / Investing.`,
    risk: `High volatility and social sentiment driven.`,
  }));
}