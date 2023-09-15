<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { Chart } from 'highcharts-vue';
import Highcharts from 'highcharts';
import exportingInit from 'highcharts/modules/exporting';
import { DateTuple } from 'src/types';
import { getChain } from 'src/config/ConfigManager';
import { PriceChartData } from 'src/types/PriceChartData';
import { getCssVar } from 'quasar';

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
            },
            title: {
                text: 'Past 24h',
            },
            xAxis: {
                dateTimeLabelFormats: {
                    day: '%A, %b %e, %l %p',
                    millisecond: '%A, %b %e, %l %p',
                },
                type: 'datetime',
            },
            yAxis: {
                title: {
                    text: 'Price',
                },
            },
            legend: {
                enabled: true,
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
                            // [0, '#571AFF'],
                            [0, getCssVar('color-graph-shadow')],
                        ],
                    },
                    marker: {
                        radius: 0.5,
                    },
                    lineWidth: 2,
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
                    color: getCssVar('primary'),
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

        const fetchPriceChartData = async () => {
            const data: PriceChartData = await chain.getPriceData();
            lastUpdated.value = data.lastUpdated;
            tokenPrice.value = formatCurrencyValue(data.tokenPrice);
            dayChange.value = formatPercentage(data.dayChange);
            dayVolume.value = formatCurrencyValue(data.dayVolume);
            marketCap.value = formatCurrencyValue(data.marketCap);
            chartOptions.value.series[0].data = data.prices;
        };
        const formatPercentage = (val: number): string => `${val.toFixed(2)} %`;
        const formatCurrencyValue = (val: number): string => val < ONE_MILLION
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
        <div class="col-xs-12 col-sx-12 col-md-8 col-lg-8 col-xs-8 q-pa-md">
            <Highcharts
                class="highcharts-description col-12"
                :options="chartOptions"
                :highcharts="hcInstance"
            />
        </div>
        <div class="col-xs-12 col-sx-12 col-md-4 col-lg-4 col-xs-4 q-pa-md">
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
    @media screen and (max-width: $medium) // screen < $medium
        text-align: center !important
    @media screen and (min-width: $medium) //screen > $medium
        text-align: left !important
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
    z-index: 1
    width: 100%
    background-color:#ffffff
    background: #FFFFFF
    box-shadow: 0px 9px 14px rgba(138, 101, 212, 0.1), 0px 1px 4px rgba(37, 42, 97, 0.3)
    border-radius: 10px

.title
    font-style: normal
    font-weight: normal
    font-size: 14px
    line-height: 17px
    text-transform: uppercase
    color: #071A5F
.sub-title
    font-style: normal
    font-weight: normal
    font-size: 22.75px
    line-height: 27px
    color: var(--q-primary)
    backdrop-filter: blur(14px)

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
