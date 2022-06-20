<script lang="ts">
import Validator from 'src/components/validators/ValidatorData.vue';
import { defineComponent, onMounted } from 'vue';
import { useStore } from 'src/store';
export default defineComponent({
  name: 'Vote',
  components: { Validator },
  setup() {
    const store = useStore();
    onMounted(async () => {
      await store.dispatch('chain/updateBpList');
      window.setInterval(() => {
        void store.dispatch('chain/updateBlockData');
      }, 500);
    });
  }
});
</script>
<template lang="pug">
Validator
</template>
<style lang="sass" scoped>
.hover-dec
  text-decoration: none
  color: $dark
  &:hover
    text-decoration: underline

.tokens-container
  display: grid
  grid-gap: 2rem
  align-items: stretch
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr))
  grid-template-rows: min-content

.token-card
  background: rgba(138, 101, 212, 0.1)
  border-radius: .2rem
  box-shadow: none
  padding: 0.5rem 0
</style>
