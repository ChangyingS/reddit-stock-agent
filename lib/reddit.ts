export type RankedStock = {
  ticker: string;
  mentions: number;
};

const FEEDS = [
  "https://www.reddit.com/r/wallstreetbets/.rss",
  "https://www.reddit.com/r/stocks/.rss",
  "https://www.reddit.com/r/investing/.rss",
];

const COMMON_WORDS = new Set([
  "THE","AND","FOR","ARE","BUT","NOT","YOU","ALL","NEW","NOW","CEO",
  "USA","ATH","IPO","LOL","THIS","THAT","WITH","HOLD","SELL","BUY",
  "MOON","PUMP","DUMP","YOLO","GAIN","LOSS","ETF","USD","IRS","GDP","AI"
]);

function extractTickers(text: string): string[] {
  const matches = text.toUpperCase().match(/\$?[A-Z]{2,5}\b/g) || [];

  return matches
    .map((t) => t.replace("$", ""))
    .filter((t) => !COMMON_WORDS.has(t));
}

async function fetchRSS(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`RSS fetch failed: ${res.status}`);
  }

  return res.text();
}

export async function getTopRedditStocks(): Promise<RankedStock[]> {
  const counts: Record<string, number> = {};

  for (const feed of FEEDS) {
    const xml = await fetchRSS(feed);

    const titles = [...xml.matchAll(/<title><!\[CDATA\[(.*?)\]\]><\/title>/g)];

    for (const match of titles) {
      const title = match[1];
      const tickers = extractTickers(title);

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