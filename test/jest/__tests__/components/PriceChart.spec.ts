/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  describe,
  expect,
  it,
  jest,
  afterEach,
  beforeEach
} from '@jest/globals';
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-jest';
import { shallowMount } from '@vue/test-utils';
import PriceChart from 'src/components/PriceChart.vue';
import { PriceStats, PriceHistory } from 'src/types';
import axios from 'axios';
import 'flush-promises';
import flushPromises from 'flush-promises';

const exchangeStatsUrl =
  'https://api.coingecko.com/api/v3/simple/price?ids=telos&vs_currencies=USD&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true';
const priceHistoryUrl =
  'https://api.coingecko.com/api/v3/coins/telos/market_chart?vs_currency=USD&days=1&interval=hourly';

const mockExchangeStats: PriceStats = {
  data: {
    telos: {
      last_updated_at: 160123456,
      usd: 2.01,
      usd_24h_change: 30000000,
      usd_24h_vol: 4444444,
      usd_market_cap: 1123456789
    }
  }
};

const mockHistoryData: PriceHistory = {
  data: {
    prices: [
      [123, 111],
      [456, 222],
      [789, 333]
    ]
  }
};

installQuasarPlugin();

describe('PriceChart', () => {
  beforeEach(() => {
    const mock = jest.spyOn(axios, 'get');
    mock.mockResolvedValueOnce(mockExchangeStats);
    mock.mockResolvedValueOnce(mockHistoryData);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('mounted', () => {
    it('calls setExchangeStats', () => {
      const methodSpy = jest.spyOn(
        PriceChart.methods as any,
        'setExchangeStats'
      );
      const wrapper = shallowMount(PriceChart);

      wrapper.vm.$nextTick(() => {
        expect(methodSpy).toHaveBeenCalled();
      });
    });

    it('calls setPriceHistory', async () => {
      const methodSpy = jest.spyOn(
        PriceChart.methods as any,
        'setPriceHistory'
      );
      const wrapper = shallowMount(PriceChart);

      wrapper.vm.$nextTick(() => {
        expect(methodSpy).toHaveBeenCalled();
      });
    });
  });
});
