<script lang="ts">
import { computed, defineComponent, ref, toRefs } from 'vue';

const PI = 3.1459;

export default defineComponent({
  name: 'PercentCircle',
  props: {
    fraction: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    label: {
      type: String,
      default: '',
    },
    radius: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const offset = ref(5);
    const { fraction, total, radius, unit } = toRefs(props);
    const diameter = computed(() => radius.value * 2);
    const circumference = computed(() => 2 * PI * radius.value);
    const containerWidth = computed(() => diameter.value + 2 * offset.value);
    const formatResourcePercent = computed(() =>
      fraction.value && total.value
        ? ((fraction.value / total.value) * 100.0).toFixed(2)
        : '0.00',
    );
    const strokeColor = computed(() =>
      parseFloat(formatResourcePercent.value) >= 90 ? 'red' : 'white',
    );
    const fractionUnits = computed(
      () => `${fraction.value}${unit.value}/${total.value}${unit.value}`,
    );
    const available = computed(() => (total.value - fraction.value).toFixed(3));
    const dashArray = computed(() => {
      if (Number.isNaN(formatResourcePercent.value)) {
        return '0';
      }
      const scaledPath =
        (parseFloat(formatResourcePercent.value) / 100) * circumference.value;
      return `${scaledPath}, ${circumference.value}`;
    });

    return {
      offset,
      diameter,
      circumference,
      containerWidth,
      formatResourcePercent,
      strokeColor,
      fractionUnits,
      available,
      dashArray,
    };
  },
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
