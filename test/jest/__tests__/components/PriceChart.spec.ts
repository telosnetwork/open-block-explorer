/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
    afterEach,
    describe,
    expect,
    it,
    jest,
} from '@jest/globals';
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-jest';
import { mount } from '@vue/test-utils';
import PriceChart from 'src/components/PriceChart.vue';

installQuasarPlugin();

jest.mock('src/stores/networks', () => ({
    useNetworksStore: jest.fn().mockImplementationOnce(()=> ({
        getCurrentNetwork: {
            getSystemToken: () => ({ symbol: 'TLOS', contract: 'eosio.token', precision: 4 }),
            getPriceData: () => ({
                tokenPrice: 0,
                dayChange: 0,
                dayVolume: 0,
                marketCap: 0,
                prices: [
                    [123, 111],
                    [456, 222],
                    [789, 333],
                ],
            }),
        },
    })).mockImplementation(() => ({
        getCurrentNetwork: {
            getSystemToken: () => ({ symbol: 'TLOS', contract: 'eosio.token', precision: 4 }),
            getPriceData: () => ({
                tokenPrice: 999999.9911,
                dayChange: 123.456,
                dayVolume: 1234567.89,
                marketCap: 123456789123.45678,
                prices: [
                    [123, 111],
                    [456, 222],
                    [789, 333],
                ],
            }),
        },
    })),
}));

describe('PriceChart', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('shows 0 when no data is available', async () => {
        const wrapper = mount(PriceChart, {
            global: {
                stubs: {
                    Highcharts: {
                        template: '<span />',
                    },
                },
            },
        });

        await wrapper.vm.$nextTick();

        expect(wrapper).not.toBe(null);

        const tokenPrice = wrapper.find('[data-test="tokenPrice"]');
        const marketCap = wrapper.find('[data-test="marketCap"]');
        const dayChange = wrapper.find('[data-test="dayChange"]');
        const dayVolume = wrapper.find('[data-test="dayVolume"]');

        const expectedTokenPrice = '$0.000';
        const expectedDayVolume = '$0.000';
        const expectedDayChange = '0.00 %';
        const expectedMarketCap = '$0.000';

        expect(dayChange.text()).toBe(expectedDayChange);
        expect(tokenPrice.text()).toBe(expectedTokenPrice);
        expect(marketCap.text()).toBe(expectedMarketCap);
        expect(dayVolume.text()).toBe(expectedDayVolume);
    });
    it('shows data properly formatted', async () => {
        const wrapper = mount(PriceChart, {
            global: {
                stubs: {
                    Highcharts: {
                        template: '<span />',
                    },
                },
            },
        });

        await wrapper.vm.$nextTick();

        expect(wrapper).not.toBe(null);

        const tokenPrice = wrapper.find('[data-test="tokenPrice"]');
        const marketCap = wrapper.find('[data-test="marketCap"]');
        const dayChange = wrapper.find('[data-test="dayChange"]');
        const dayVolume = wrapper.find('[data-test="dayVolume"]');

        const expectedTokenPrice = '$999999.99';
        const expectedDayVolume = '$1.23M';
        const expectedDayChange = '123.46 %';
        const expectedMarketCap = '$123.46B';

        expect(dayChange.text()).toBe(expectedDayChange);
        expect(tokenPrice.text()).toBe(expectedTokenPrice);
        expect(marketCap.text()).toBe(expectedMarketCap);
        expect(dayVolume.text()).toBe(expectedDayVolume);
    });
});
