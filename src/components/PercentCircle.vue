<template lang="pug">
svg.circular-chart( :viewBox="`0 0 ${containerWidth} ${containerWidth}`" )
  path.circle.data-circle(
    :stroke-dasharray="dashArray"
    d="M46 2 a 44 44 0 0 1 0 88 a 44 44 0 0 1 0 -88"
    fill="none"
    :stroke="strokeColor"
    )
  path.circle(
    :stroke-dasharray="`${circumference}, ${circumference}`"
    d="M46 2 a 44 44 0 0 1 0 88 a 44 44 0 0 1 0 -88"
    fill="none"
    stroke="white"
    stroke-opacity=".13"
    stroke-width="1"
    )
  text( :x="radius" y="38"
    text-anchor="middle"
    dominant-baseline="middle"
    fill="white"
    font-size="14px"
    font-weight=700
    ) {{ label }}
  text( :x="radius + 3" y="56" 
    text-anchor="middle"
    dominant-baseline="middle"
    fill="white"
    fill-opacity=".5"
    font-size="14px"
    ) {{ percentage }}%
</template>
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
      required: true
    },
    radius: {
      type: Number,
      required: true
    }
  },
  computed: {
    diameter(): number {
      return 2 * this.radius;
    },
    containerWidth(): number {
      return this.diameter + 4;
    },
    strokeColor(): string {
      return this.percentage < 90 ? 'white' : 'red';
    },
    circumference(): number {
      return 2 * PI * this.radius;
    },
    dashArray(): string {
      const scaledPath = (this.percentage / 100) * this.circumference;
      return `${scaledPath}, ${this.circumference}`;
    }
  }
});
</script>
<style lang="sass" scoped>
.circular-chart
  display: inline-block
  margin: 0 10px
  max-height: 92px

.circle
  fill: none
  stroke-width: 2.8
  stroke-linecap: round

.data-circle
  stroke-width: 4px
  animation: progress 1s ease-out forwards

@keyframes progress
  0%
    stroke-dasharray: 0 100
</style>
