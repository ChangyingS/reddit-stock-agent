import { RankedStock } from "./reddit";

type StockProfile = {
  name: string;
  business: string;
};

const STOCK_DB: Record<string, StockProfile> = {
  NVDA: { name: "NVIDIA", business: "AI chips, GPUs, and accelerated computing" },
  TSLA: { name: "Tesla", business: "Electric vehicles, energy storage, and robotics" },
  AMD: { name: "AMD", business: "Semiconductors, CPUs, GPUs, and AI chips" },
  AAPL: { name: "Apple", business: "Consumer electronics, software, and services" },
  MSFT: { name: "Microsoft", business: "Cloud, software, enterprise AI" },
  PLTR: { name: "Palantir", business: "Data analytics and AI software" },
  GME: { name: "GameStop", business: "Gaming retail and meme-stock speculation" }
};

function inferReason(ticker: string): string {
  if (["NVDA", "AMD", "MSFT", "PLTR"].includes(ticker)) return "AI / earnings / tech momentum";
  if (ticker === "TSLA") return "EV delivery / volatility / macro";
  if (ticker === "GME") return "Meme-stock speculation";
  return "High Reddit discussion volume";
}

export function generateReport(stocks: RankedStock[]) {
  return stocks
    .map((stock, index) => {
      const profile = STOCK_DB[stock.ticker] || {
        name: stock.ticker,
        business: "Public company under active discussion"
      };

      return `${index + 1}. ${stock.ticker} (${profile.name})
Reddit Rank: #${index + 1}
Mentions: ${stock.mentions}
Business: ${profile.business}
Hot Reason: ${inferReason(stock.ticker)}
Risk: Reddit sentiment can be volatile and is not investment advice.
`;
    })
    .join("\n");
}