export type RankedStock = {
  ticker: string;
  mentions: number;
  rank: number;
};

type ApeWisdomItem = {
  ticker: string;
  mentions?: number;
  rank?: number;
};

export async function getTopRedditStocks(): Promise<RankedStock[]> {
  try {
    // ApeWisdom tracks trending Reddit / WSB stocks
    const response = await fetch("https://apewisdom.io/api/v1.0/filter/all-stocks/page/1", {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`ApeWisdom fetch failed: ${response.status}`);
    }

    const json = await response.json();

    if (!json.results || !Array.isArray(json.results)) {
      throw new Error("Invalid ApeWisdom response");
    }

    return json.results
      .slice(0, 10)
      .map((stock: ApeWisdomItem, index: number) => ({
        ticker: stock.ticker,
        mentions: stock.mentions ?? 0,
        rank: stock.rank ?? index + 1,
      }));
  } catch (error) {
    console.error("ApeWisdom stock fetch failed:", error);
    return [];
  }
}