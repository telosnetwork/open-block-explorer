import axios from 'axios';
import { PriceStats, PriceHistory } from 'src/types';
import { PriceChartData } from 'src/types/PriceChartData';

export const getCoingeckoUsdPrice = async (
  tokenId: string
): Promise<number> => {
  const stats: PriceStats = await axios.get(
    getCoingeckoExchangeStatsUrl(tokenId)
  );

  return stats.data[tokenId].usd;
};

export const getCoingeckoPriceChartData = async (
  tokenId: string
): Promise<PriceChartData> => {
  const exchangeStatsUrl = getCoingeckoExchangeStatsUrl(tokenId);
  const priceHistoryUrl = `https://api.coingecko.com/api/v3/coins/${tokenId}/market_chart?vs_currency=USD&days=1&interval=hourly`;

  const [priceStats, priceHistory]: [PriceStats, PriceHistory] =
    await Promise.all([
      axios.get(exchangeStatsUrl),
      axios.get(priceHistoryUrl)
    ]);

  return {
    lastUpdated: priceStats.data[tokenId].last_updated_at,
    tokenPrice: priceStats.data[tokenId].usd,
    dayChange: priceStats.data[tokenId].usd_24h_change,
    dayVolume: priceStats.data[tokenId].usd_24h_vol,
    marketCap: priceStats.data[tokenId].usd_market_cap,
    prices: priceHistory.data.prices
  };
};

// eslint-disable-next-line @typescript-eslint/require-await
export const getEmptyPriceChartData = async (): Promise<PriceChartData> => {
  return {
    lastUpdated: 0,
    tokenPrice: 0,
    dayChange: 0,
    dayVolume: 0,
    marketCap: 0,
    prices: []
  };
};

const getCoingeckoExchangeStatsUrl = (tokenId: string): string => {
  return `https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=USD&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true`;
};
