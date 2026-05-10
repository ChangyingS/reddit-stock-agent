const SUBREDDITS = ["wallstreetbets", "stocks", "investing"];

const COMMON_FALSE_POSITIVES = new Set([
  "YOLO",
  "HOLD",
  "MOON",
  "CEO",
  "USA",
  "GDP",
  "ETF",
  "IMO",
  "FOMO",
  "DD",
  "AI"
]);

export type RankedStock = {
  ticker: string;
  mentions: number;
};

function extractTickers(text: string): string[] {
  const matches = text.toUpperCase().match(/\b[A-Z]{2,5}\b/g) || [];
  return matches.filter((ticker) => !COMMON_FALSE_POSITIVES.has(ticker));
}

export async function getTopRedditStocks(): Promise<RankedStock[]> {
  const counts: Record<string, number> = {};

  for (const subreddit of SUBREDDITS) {
    const response = await fetch(
      `https://www.reddit.com/r/${subreddit}/top.json?t=week&limit=100`,
      {
        headers: {
          "User-Agent": "reddit-stock-agent/1.0"
        },
        cache: "no-store"
      }
    );

    if (!response.ok) continue;

    const json = await response.json();

    const posts = json?.data?.children || [];

    for (const post of posts) {
      const content = `${post.data.title} ${post.data.selftext || ""}`;
      const tickers = extractTickers(content);

      for (const ticker of tickers) {
        counts[ticker] = (counts[ticker] || 0) + 1;
      }
    }
  }

  return Object.entries(counts)
    .map(([ticker, mentions]) => ({ ticker, mentions }))
    .sort((a, b) => b.mentions - a.mentions)
    .slice(0, 10);
}