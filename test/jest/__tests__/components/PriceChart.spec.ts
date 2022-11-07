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
    it('calls fetchPriceChartData', () => {
      const methodSpy = jest.spyOn(
        PriceChart.methods as any,
        'fetchPriceChartData'
      );
      const wrapper = shallowMount(PriceChart);

      wrapper.vm.$nextTick(() => {
        expect(methodSpy).toHaveBeenCalled();
      });
    });

    // it('calls setPriceHistory', () => {
    //   const methodSpy = jest.spyOn(
    //     PriceChart.methods as any,
    //     'setPriceHistory'
    //   );
    //   const wrapper = shallowMount(PriceChart);

    //   wrapper.vm.$nextTick(() => {
    //     expect(methodSpy).toHaveBeenCalled();
    //   });
    // });
  });
});
