<template lang="pug">
svg.circular-chart( viewBox="0 0 92 92" )
  path.circle.data-circle(
    :stroke-dasharray="dashArray"
    d="M46 2 a 44 44 0 0 1 0 88 a 44 44 0 0 1 0 -88"
    fill="none"
    :stroke="strokeColor"
    stroke-width="3"
    )
  path.circle(
    :stroke-dasharray="`${circumference}, ${circumference}`"
    d="M46 2 a 44 44 0 0 1 0 88 a 44 44 0 0 1 0 -88"
    fill="none"
    stroke="rgba(255,255,255,.13)"
    stroke-width="2"
    )
  text( x="44" y="44" 
    text-anchor="middle"
    stroke-width="1px"
    dominant-baseline="middle"
    fill="white"
    font-size="14px"
    font-weight=700
    ) {{ label }}

  text( x="44" y="64" 
    text-anchor="middle"
    stroke-width="1px"
    dominant-baseline="middle"
    fill="white"
    font-size="14px"
    ) {{ percentage }}%
</template>
<script lang="ts">
import { defineComponent } from 'vue';

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
    }
  },
  data() {
    return {
      radius: 44,
      diameter: 88,
      containerWidth: 92
    };
  },
  computed: {
    strokeColor(): string {
      return this.percentage > 90 ? 'red' : 'white';
    },
    circumference(): number {
      return 2 * 3.1459 * this.radius;
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
  margin: 0 20px
  max-height: 92px

.circle
  fill: none
  stroke-width: 2.8
  stroke-linecap: round
  &.data-circle
    animation: progress 1s ease-out forwards


@keyframes progress
  0%
    stroke-dasharray: 0 100
</style>
