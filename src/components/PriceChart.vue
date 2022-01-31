<template lang="pug">
div.row.col-12.justify-center(align="center")
    div.row.col-11.price-box.flex
        div.col-xs-12.col-sx-12.col-md-8.col-lg-8.col-xs-8.q-pa-md
            highcharts.highcharts-description.col-12(:options="chartOptions" style="height:250px" :highcharts="hcInstance" :color="colors")
        div.col-xs-12.col-sx-12.col-md-4.col-lg-4.col-xs-4.q-pa-md
            div.col-12.flex.row.q-mt-md
                div.col-6.chart-info
                    p TOKEN PRICE
                    p.sub-title $0.55
                    p.border-line
                div.col-6.chart-info
                    p MARKETCAP
                    p.sub-title $240B
                    p.border-line
            div.col-12.flex.row
                div.col-6.chart-info
                    p RANK
                    p.sub-title 52
                div.col-6.chart-info
                    p 24H VOLUME
                    p.sub-title $322M
    
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Chart } from 'highcharts-vue';
import Highcharts from 'highcharts';
import exportingInit from 'highcharts/modules/exporting';

exportingInit(Highcharts);
export default defineComponent({
  name: 'PriceChart',
  components: {
    highcharts: Chart
  },
  data() {
    return {
      hcInstance: Highcharts,
      chartOptions: {
        //   uncomment to fill area
        chart: {
          type: 'area'
        },
        title: {
          text: 'Past 24h'
        },
        xAxis: {
          type: 'date'
        },
        yAxis: {
          title: {
            text: 'Price'
          }
        },
        legend: {
          enabled: true
        },
        plotOptions: {
          area: {
            // uncomment to display gradient
            fillColor: {
              linearGradient: {
                x1: 0,
                y1: 0,
                x2: 0,
                y2: 1
              },
              stops: [
                // [0, '#571AFF'],
                [0, 'rgba(234 , 227 , 252 , 0.6)'],
                [1, 'rgba(87, 26, 255, 0.003)'],
                [2, 'rgba(87, 26, 255, 0.0001)'],
                [3, 'rgba(87, 26, 255, 0)']
              ]
            },
            marker: {
              radius: 0.5
            },
            lineWidth: 2,
            states: {
              hover: {
                lineWidth: 4
              }
            },
            threshold: null
          }
        },
        series: [
          {
            name: 'TLOS',
            color: '#571AFF',
            data: [
              1, 2, 3, 10, 40, 50, 60, 70, 60, 49, 70, 60, 70, 80, 90, 80, 51,
              52, 63, 54, 40, 62, 70, 65, 49, 50, 55, 40, 64, 40, 45, 40, 30,
              55, 65, 70, 80, 60, 50
            ]
          }
        ]
      }
    };
  },

  methods: {}
});
</script>

<style lang="sass" scoped>
$medium:1000px
.chart-info
    @media screen and (max-width: $medium) // screen < 1000px
        text-align: center !important
    @media screen and (min-width: $medium) //screen > 1000px
        text-align: left !important
.border-line
    width: 19px
    height: 2px
    background: $primary
    border-radius: 4px
    @media screen and (max-width: $medium) // screen < 1000px
        width: 156px !important
        margin: auto
        margin-buttom: 22px
    @media screen and (min-width: $medium) //screen > 1000px
        width: 19px
.price-box
    background-color:#ffffff
    height: 280px
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
    color: $primary
    backdrop-filter: blur(14px)

.highcharts-figure,
.highcharts-data-table table
  min-width: 360px
  max-width: 800px
  margin: 1em auto

.highcharts-data-table table
  font-family: Verdana, sans-serif
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
</style>
