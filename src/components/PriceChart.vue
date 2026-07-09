<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { Chart } from 'highcharts-vue';
import Highcharts from 'highcharts';
import exportingInit from 'highcharts/modules/exporting';
import { DateTuple } from 'src/types';
import { getChain } from 'src/config/ConfigManager';
import { PriceChartData } from 'src/types/PriceChartData';

const chain = getChain();

const ONE_MILLION = 1000000;
const ONE_BILLION = 1000000000;

exportingInit(Highcharts);
export default defineComponent({
    name: 'PriceChart',
    components: {
        Highcharts: Chart,
    },
    setup() {
        const hcInstance = Highcharts;
        const chartOptions = ref({
            //   uncomment to fill area
            chart: {
                type: 'area',
                backgroundColor: 'transparent',
                spacing: [16, 18, 10, 10],
            },
            title: {
                text: 'Past 24h',
                style: {
                    color: '#2C2B2F',
                    fontFamily: 'Silka, Arial, sans-serif',
                    fontSize: '22px',
                    fontWeight: '600',
                },
            },
            xAxis: {
                dateTimeLabelFormats: {
                    day: '%A, %b %e, %l %p',
                    millisecond: '%A, %b %e, %l %p',
                },
                type: 'datetime',
                gridLineColor: 'rgba(79, 172, 254, 0.12)',
                lineColor: 'rgba(44, 43, 47, 0.28)',
                tickColor: 'rgba(44, 43, 47, 0.28)',
                labels: {
                    style: {
                        color: '#404142',
                        fontFamily: 'Silka, Arial, sans-serif',
                    },
                },
            },
            yAxis: {
                title: {
                    text: 'Price',
                    style: {
                        color: '#404142',
                        fontFamily: 'Silka, Arial, sans-serif',
                    },
                },
                gridLineColor: 'rgba(79, 172, 254, 0.18)',
                labels: {
                    style: {
                        color: '#404142',
                        fontFamily: 'Silka, Arial, sans-serif',
                    },
                },
            },
            legend: {
                enabled: true,
                itemStyle: {
                    color: '#2C2B2F',
                    fontFamily: 'Silka, Arial, sans-serif',
                    fontWeight: '600',
                },
            },
            credits: {
                style: {
                    color: '#404142',
                },
            },
            plotOptions: {
                area: {
                    // uncomment to display gradient
                    fillColor: {
                        linearGradient: {
                            x1: 0,
                            y1: 0,
                            x2: 0,
                            y2: 1,
                        },
                        stops: [
                            // [0, getCssVar('primary')],
                            [0, 'rgba(79, 172, 254, 0.24)'],
                            [1, 'rgba(196, 113, 245, 0.04)'],
                        ],
                    },
                    marker: {
                        radius: 2,
                        lineColor: '#FFFFFF',
                        lineWidth: 1,
                    },
                    lineWidth: 2.5,
                    states: {
                        hover: {
                            lineWidth: 4,
                        },
                    },
                    threshold: null,
                },
            },
            series: [
                {
                    name: chain.getSystemToken().symbol,
                    color: '#2C2B2F',
                    data: [] as DateTuple[],
                },
            ],
            tooltip: {
                dateTimeLabelFormats: {
                    hour: '%A, %b %e, %l %p',
                },
            },
        });
        const lastUpdated = ref(0);
        const tokenPrice = ref('');
        const marketCap = ref('');
        const rank = ref('');
        const dayVolume = ref('');
        const dayChange = ref('');
        const priceDataError = ref(false);

        const fetchPriceChartData = async () => {
            try {
                const data: PriceChartData = await chain.getPriceData();
                lastUpdated.value = data.lastUpdated;
                tokenPrice.value = formatCurrencyValue(data.tokenPrice);
                dayChange.value = formatPercentage(data.dayChange);
                dayVolume.value = formatCurrencyValue(data.dayVolume);
                marketCap.value = formatCurrencyValue(data.marketCap);
                priceDataError.value = data.prices.length === 0;
                chartOptions.value = {
                    ...chartOptions.value,
                    series: [
                        {
                            ...chartOptions.value.series[0],
                            data: data.prices,
                        },
                    ],
                };
            } catch (error) {
                console.error(error);
                priceDataError.value = true;
                tokenPrice.value = '--';
                dayChange.value = '--';
                dayVolume.value = '--';
                marketCap.value = '--';
            }
        };
        const formatPercentage = (val: number): string => `${val.toFixed(2)} %`;
        const formatCurrencyValue = (val: number): string => val < 1 ? `$${val.toFixed(3)}` : val < ONE_MILLION
            ? `$${val.toFixed(2)}`
            : val < ONE_BILLION
                ? `$${(val / ONE_MILLION).toFixed(2)}M`
                : `$${(val / ONE_BILLION).toFixed(2)}B`;

        onMounted(async () => {
            await fetchPriceChartData();
        });
        return {
            hcInstance,
            chartOptions,
            lastUpdated,
            tokenPrice,
            marketCap,
            rank,
            dayVolume,
            dayChange,
            priceDataError,
            fetchPriceChartData,
            formatPercentage,
            formatCurrencyValue,
        };
    },
});
</script>

<template>
<div class="price-chart row col-12 justify-center actor-font" align="center">
    <div class="row col-11 price-box flex">
        <div class="col-xs-12 col-sx-12 col-md-8 col-lg-8 col-xs-8 q-pa-md chart-pane">
            <Highcharts
                class="highcharts-description col-12"
                :options="chartOptions"
                :highcharts="hcInstance"
            />
            <div v-if="priceDataError" class="chart-status">Price data unavailable</div>
        </div>
        <div class="col-xs-12 col-sx-12 col-md-4 col-lg-4 col-xs-4 q-pa-md metrics-pane">
            <div class="col-12 flex row q-mt-md">
                <div class="col-6 chart-info">
                    <p>TOKEN PRICE</p>
                    <p class="sub-title">{{ tokenPrice}}</p>
                    <p class="border-line"></p>
                </div>
                <div class="col-6 chart-info">
                    <p>MARKETCAP</p>
                    <p class="sub-title">{{ marketCap }}</p>
                    <p class="border-line"></p>
                </div>
            </div>
            <div class="col-12 flex row">
                <div class="col-6 chart-info">
                    <p>24H CHANGE</p>
                    <p class="sub-title">{{ dayChange  }}</p>
                </div>
                <div class="col-6 chart-info">
                    <p>24H VOLUME</p>
                    <p class="sub-title">{{ dayVolume }}</p>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<style lang="sass" scoped>
$medium:750px
.chart-info
    position: relative
    min-height: 108px
    padding: 12px 12px 10px 18px
    border-top: 1px solid rgba(79, 172, 254, 0.18)
    p
        margin-bottom: 10px
    p:first-child
        color: var(--q-secondary)
        font-size: 13px
        font-weight: 600
        letter-spacing: 0
    &::before
        content: ''
        position: absolute
        top: 17px
        bottom: 18px
        left: 0
        width: 3px
        border-radius: 4px
        background: linear-gradient(180deg, rgba(0, 242, 254, 0.82) 0%, rgba(196, 113, 245, 0.82) 100%)
    @media screen and (max-width: $medium) // screen < $medium
        text-align: center !important
        padding-left: 12px
        &::before
            top: auto
            right: calc(50% - 24px)
            bottom: 0
            left: calc(50% - 24px)
            width: 48px
            height: 4px
    @media screen and (min-width: $medium) //screen > $medium
        text-align: left !important
.chart-status
    color: var(--q-secondary)
    font-size: 13px
    font-weight: 500
    margin-top: -18px
.border-line
    width: 19px
    height: 2px
    background: var(--q-primary)
    border-radius: 4px
    @media screen and (max-width: $medium) // screen < $medium
        width: 156px !important
        margin: auto
        margin-buttom: 22px
    @media screen and (min-width: $medium) //screen > $medium
        width: 19px
.price-box
    position: relative
    overflow: hidden
    z-index: 1
    width: 100%
    background-color:#ffffff
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(250, 252, 255, 0.98) 62%, rgba(246, 235, 255, 0.36) 100%)
    border: 1px solid rgba(79, 172, 254, 0.24)
    box-shadow: 0 14px 30px rgba(79, 172, 254, 0.16), 0 4px 12px rgba(44, 43, 47, 0.12)
    border-radius: 8px
    &::before
        content: ''
        position: absolute
        top: 0
        right: 0
        left: 0
        height: 4px
        background: var(--q-color-primary-gradient)
    &::after
        content: ''
        position: absolute
        top: 4px
        right: 0
        bottom: 0
        left: 0
        background: radial-gradient(circle at 84% 18%, rgba(0, 242, 254, 0.07) 0%, rgba(0, 242, 254, 0) 34%), radial-gradient(circle at 88% 82%, rgba(196, 113, 245, 0.06) 0%, rgba(196, 113, 245, 0) 36%)
        pointer-events: none

.chart-pane,
.metrics-pane
    position: relative
    z-index: 1

.title
    font-style: normal
    font-weight: normal
    font-size: 14px
    line-height: 17px
    text-transform: uppercase
    color: var(--q-secondary)
.sub-title
    font-style: normal
    font-weight: 600
    font-size: 24px
    line-height: 29px
    color: var(--q-primary)

.highcharts-figure,
.highcharts-data-table table
  min-width: 360px
  max-width: 800px
  margin: 1em auto

.highcharts-data-table table
  border-collapse: collapse
  border: 1px solid #ebebeb
  margin: 10px auto
  text-align: center
  width: 100%
  max-width: 500px

.highcharts-data-table caption
  padding: 1em 0
  font-size: 1.2em
  color: #555

.highcharts-data-table th
  font-weight: 600
  padding: 0.5em

.highcharts-data-table td,
.highcharts-data-table th,
.highcharts-data-table caption
  padding: 0.5em

.highcharts-data-table thead tr,
.highcharts-data-table tr:nth-child(even)
  background: #f8f8f8

.highcharts-data-table tr:hover
  background: #f1f7ff

.highcharts-description
  height:250px
</style>
