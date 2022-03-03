<template lang="pug">
svg.circular-chart( viewBox="0 0 92 92" )
  path.circle(
    :stroke-dasharray="dashArray"
    d="M46 2 a 44 44 0 0 1 0 88 a 44 44 0 0 1 0 -88"
    fill="none"
    :stroke="strokeColor"
    stroke-width="1"
)
</template>
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'PercentCircle',
  props: {
    percentage: {
      type: Number,
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
  margin: 10px auto
  max-width: 80%
  max-height: 92px

.circle
  fill: none
  stroke-width: 2.8
  stroke-linecap: round
  animation: progress 1s ease-out forwards

@keyframes progress
  0%
    stroke-dasharray: 0 100
</style>
