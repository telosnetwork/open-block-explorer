<template lang="pug">
.producer-map 
  .producer-map-label Producer Map Here
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ProducerMap',
  props: {}
});
</script>
<style lang="sass">
.producer-map
  display: flex
  justify-content: center
  align-items: center
  height: 20rem
  margin-top: 2rem

.producer-map-label
</style>
