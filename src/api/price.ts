import axios from 'axios';
import { DateTuple, PriceStats, PriceHistory } from 'src/types';
import { PriceChartData } from 'src/types/PriceChartData';

const HOURS_23_MS = 23 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

interface CoinPaprikaTicker {
  last_updated: string;
  quotes: {
    USD: {
      price: number;
      volume_24h: number;
      market_cap: number;
      percent_change_24h: number;
    };
  };
}

interface CoinPaprikaHistoryPoint {
  timestamp: string;
  price: number;
}

interface TelosMarketData {
  collected: number;
  price: number;
  market_cap: string;
  volume: string;
}

export const getCoingeckoUsdPrice = async (
    tokenId: string,
): Promise<number> => {
    try {
        const stats: PriceStats = await axios.get(
            getCoingeckoExchangeStatsUrl(tokenId),
        );

        return stats.data[tokenId].usd;
    } catch (error) {
        if (tokenId === 'telos') {
            return getTelosFallbackUsdPrice();
        }
        throw error;
    }
};

export const getCoingeckoPriceChartData = async (
    tokenId: string,
): Promise<PriceChartData> => {
    try {
        const exchangeStatsUrl = getCoingeckoExchangeStatsUrl(tokenId);
        const priceHistoryUrl = `https://api.coingecko.com/api/v3/coins/${tokenId}/market_chart?vs_currency=USD&days=1`;  // &interval=hourly` - restore if when enterprise plan enabled;

        const [priceStats, priceHistory]: [PriceStats, PriceHistory] =
        await Promise.all([
            axios.get(exchangeStatsUrl),
            axios.get(priceHistoryUrl),
        ]);

        return {
            lastUpdated: priceStats.data[tokenId].last_updated_at,
            tokenPrice: priceStats.data[tokenId].usd,
            dayChange: priceStats.data[tokenId].usd_24h_change,
            dayVolume: priceStats.data[tokenId].usd_24h_vol,
            marketCap: priceStats.data[tokenId].usd_market_cap,
            prices: normalizePriceSeries(priceHistory.data.prices, priceStats.data[tokenId].usd),
        };
    } catch (error) {
        if (tokenId === 'telos') {
            return getCoinPaprikaTelosPriceChartData();
        }
        throw error;
    }
};

// eslint-disable-next-line @typescript-eslint/require-await
export const getEmptyPriceChartData = async (): Promise<PriceChartData> => ({
    lastUpdated: 0,
    tokenPrice: 0,
    dayChange: 0,
    dayVolume: 0,
    marketCap: 0,
    prices: [],
});

const getCoingeckoExchangeStatsUrl = (tokenId: string): string => `https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=USD&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true`;

const getCoinPaprikaTelosPriceChartData = async (): Promise<PriceChartData> => {
    try {
        const start = new Date(Date.now() - HOURS_23_MS).toISOString();
        const [ticker, history] = await Promise.all([
            axios.get<CoinPaprikaTicker>('https://api.coinpaprika.com/v1/tickers/tlos-telos'),
            axios.get<CoinPaprikaHistoryPoint[]>(
                `https://api.coinpaprika.com/v1/tickers/tlos-telos/historical?start=${encodeURIComponent(start)}&interval=1h`,
            ),
        ]);
        const usd = ticker.data.quotes.USD;
        const prices = history.data
            .map(point => [Date.parse(point.timestamp), point.price] as DateTuple)
            .filter(([timestamp, price]) => Number.isFinite(Number(timestamp)) && Number.isFinite(price));

        return {
            lastUpdated: Date.parse(ticker.data.last_updated) / 1000,
            tokenPrice: usd.price,
            dayChange: usd.percent_change_24h,
            dayVolume: usd.volume_24h,
            marketCap: usd.market_cap,
            prices: normalizePriceSeries(prices, usd.price),
        };
    } catch (error) {
        return getTelosMarketDataFallback();
    }
};

const getTelosMarketDataFallback = async (): Promise<PriceChartData> => {
    const marketData = await getTelosMarketData();

    return {
        lastUpdated: marketData.collected / 1000,
        tokenPrice: marketData.price,
        dayChange: 0,
        dayVolume: Number(marketData.volume),
        marketCap: Number(marketData.market_cap),
        prices: normalizePriceSeries([], marketData.price),
    };
};

const getTelosFallbackUsdPrice = async (): Promise<number> => {
    try {
        const marketData = await getTelosMarketData();
        return marketData.price;
    } catch (error) {
        const ticker = await axios.get<CoinPaprikaTicker>('https://api.coinpaprika.com/v1/tickers/tlos-telos');
        return ticker.data.quotes.USD.price;
    }
};

const getTelosMarketData = async (): Promise<TelosMarketData> => {
    const response = await axios.get<TelosMarketData[]>(
        'https://api.telos.net/v1/evm/tokens/marketdata?symbols=TLOS',
    );

    return response.data[0];
};

const normalizePriceSeries = (prices: DateTuple[], currentPrice: number): DateTuple[] => {
    if (prices.length >= 2) {
        return prices;
    }

    if (!Number.isFinite(currentPrice) || currentPrice <= 0) {
        return [];
    }

    const now = Date.now();
    return [
        [now - DAY_MS, currentPrice],
        [now, currentPrice],
    ];
};
