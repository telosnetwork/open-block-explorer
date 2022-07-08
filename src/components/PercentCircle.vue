<script lang="ts">
import { defineComponent } from 'vue';

const PI = 3.1459;

export default defineComponent({
  name: 'PercentCircle',
  props: {
    fraction: {
      type: Number,
      required: true
    },
    total: {
      type: Number,
      required: true
    },
    label: {
      type: String,
      default: ''
    },
    radius: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      offset: 5
    };
  },
  computed: {
    diameter(): number {
      return 2 * this.radius;
    },
    circumference(): number {
      return 2 * PI * this.radius;
    },
    containerWidth(): number {
      return this.diameter + 2 * this.offset;
    },
    strokeColor(): string {
      return parseFloat(this.formatResourcePercent) >= 90 ? 'red' : 'white';
    },
    dashArray(): string {
      if (Number.isNaN(this.formatResourcePercent)) {
        return '0';
      }
      const scaledPath =
        (parseFloat(this.formatResourcePercent) / 100) * this.circumference;
      return `${scaledPath}, ${this.circumference}`;
    },
    formatResourcePercent(): string {
      return ((this.fraction / this.total) * 100.0).toFixed(2);
    },
    fractionUnits(): string {
      return `${this.fraction}${this.unit}/${this.total}${this.unit}`;
    },
    available(): string {
      return (this.total - this.fraction).toFixed(3);
    }
  }
});
</script>

<template lang="pug">
div.chart-container
  svg.circular-chart(:style="{ 'max-width': containerWidth }" :viewBox="`${-offset * 6} ${-offset / 2} ${containerWidth} ${containerWidth}`" )
    path.circle-bg( 
      :d="`M18 2 a ${radius} ${radius} 0 0 1 0 88 a ${radius} ${radius} 0 0 1 0 ${-diameter}`"
    )
    path.circle( 
      :stroke-dasharray="dashArray"
      :d="`M18 2 a ${radius} ${radius} 0 0 1 0 88 a ${radius} ${radius} 0 0 1 0 ${-diameter}`"
      :stroke='strokeColor'
      :style="{ 'stroke-opacity' : Number.isNaN(formatResourcePercent) ? 0 : 1, 'stroke' : !Number.isNaN(formatResourcePercent) && Number(formatResourcePercent) > 80 ? 'red' : 'white' }"
    )
    text.text.label( 
      x="18"
      :y="radius - offset"
    ) {{ label }} 
    text.text.percentage(
      v-if='!Number.isNaN(formatResourcePercent)'
      x="20"
      :y="radius + 12" 
    ) {{ formatResourcePercent }}%
  p.text.usage USED: {{ this.fraction }} {{ this.unit }}
  p.text.usage TOTAL: {{ this.total }} {{ this.unit }}
  p.text.usage AVAILABLE: {{ available }} {{ this.unit }}
</template>

<style lang="sass" scoped>
.chart-container
  display: inline-block
  margin:.5rem

.circular-chart
  margin: 0 6px
  width: 8rem

.circle-bg
  fill: none
  stroke: #eee
  stroke-width: 2
  stroke-opacity: .5

.circle
  fill: none
  stroke-width: 5
  stroke-linecap: round
  animation: progress 1s ease-out forwards

@keyframes progress
  0%
    stroke-dasharray: 0 500

.text
  text-anchor: middle
  dominant-baseline: middle
  fill: white
  font-size: 14px

.label
  font-weight: 700

.percentage
  fill-opacity: .75

.usage
  font-size: 10px
  margin: 0
</style>
