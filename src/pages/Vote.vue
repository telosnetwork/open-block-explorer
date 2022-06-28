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

<style lang="sass" scoped></style>
