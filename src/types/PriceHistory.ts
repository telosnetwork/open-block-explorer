export interface PriceHistory {
  data: {
    prices: DateTuple[];
  };
}

export type DateTuple = [number | string, number];
