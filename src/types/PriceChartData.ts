import { DateTuple } from 'src/types/PriceHistory';

export interface PriceChartData {
  lastUpdated: number;
  tokenPrice: number;
  dayChange: number;
  dayVolume: number;
  marketCap: number;
  prices: DateTuple[];
}
