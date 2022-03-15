<script lang="ts">
import { defineComponent } from 'vue';

const PI = 3.1459;

export default defineComponent({
  name: 'PercentCircle',
  props: {
    percentage: {
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
      return this.percentage >= 90 ? 'red' : 'white';
    },
    dashArray(): string {
      if (Number.isNaN(this.percentage)) {
        return '0';
      }
      const scaledPath = (this.percentage / 100) * this.circumference;
      return `${scaledPath}, ${this.circumference}`;
    }
  }
});
</script>

<template lang="pug">
svg.circular-chart(:style="{ 'max-width': containerWidth }" :viewBox="`${-offset * 6} ${-offset / 2} ${containerWidth} ${containerWidth}`" )
  path.circle-bg( 
    :d="`M18 2 a ${radius} ${radius} 0 0 1 0 88 a ${radius} ${radius} 0 0 1 0 ${-diameter}`"
    )
  path.circle( 
    :stroke-dasharray="dashArray"
    :d="`M18 2 a ${radius} ${radius} 0 0 1 0 88 a ${radius} ${radius} 0 0 1 0 ${-diameter}`"
    :stroke='strokeColor'
    :style="{ 'stroke-opacity' : Number.isNaN(percentage) ? 0 : 1 }"
    )
  text.text.label( 
    x="18"
    :y="radius - offset"
    ) {{ label }}
  text.text.percentage(
    v-if='!Number.isNaN(percentage)'
    x="20" 
    :y="radius + 14" 
    ) {{ percentage }}%
</template>

<style lang="sass" scoped>
.circular-chart
  display: inline-block
  margin: 0 6px

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
  fill-opacity: .5
</style>
