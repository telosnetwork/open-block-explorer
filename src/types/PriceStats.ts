export interface PriceStats {
  data: {
    [tokenId: string]: {
      last_updated_at: number;
      usd: number;
      usd_24h_change: number;
      usd_24h_vol: number;
      usd_market_cap: number;
    };
  };
}
