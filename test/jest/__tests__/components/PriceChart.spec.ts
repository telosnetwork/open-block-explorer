/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
    describe,
    expect,
    it,
    jest,
    afterEach,
    beforeEach,
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
            usd_market_cap: 1123456789,
        },
    },
};

const mockHistoryData: PriceHistory = {
    data: {
        prices: [
            [123, 111],
            [456, 222],
            [789, 333],
        ],
    },
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

    describe('methods', () => {
        describe('formatPercentage', () => {
            it('returns value rounded to 2 decimals as a % string', () => {
                const testVal = 123.456;
                const expected = '123.46 %';
                const wrapper = shallowMount(PriceChart);
                const received = wrapper.vm.formatPercentage(testVal);

                expect(received).toBe(expected);
            });
        });
        describe('formatCurrencyValue', () => {
            it('returns value as "$" rounded to 2 decimals if value is less than a million', () => {
                const testVal = 999999.9911;
                const expected = '$999999.99';
                const wrapper = shallowMount(PriceChart);
                const received = wrapper.vm.formatCurrencyValue(testVal);

                expect(received).toBe(expected);
            });
            it('returns value "$" divided by a million rounded to 2 decimals and appended with "M" if value is greater than a million and less than a billion', () => {
                const testVal = 1234567.89;
                const expected = '$1.23M';
                const wrapper = shallowMount(PriceChart);
                const received = wrapper.vm.formatCurrencyValue(testVal);

                expect(received).toBe(expected);
            });
            it('returns value "$" divided by a billion rounded to 2 decimals and appended with "B" if value is greater than a billion', () => {
                const testVal = 123456789123.45678;
                const expected = '$123.46B';
                const wrapper = shallowMount(PriceChart);
                const received = wrapper.vm.formatCurrencyValue(testVal);

                expect(received).toBe(expected);
            });
        });
    });
});
