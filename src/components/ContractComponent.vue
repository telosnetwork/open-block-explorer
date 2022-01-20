<template lang="pug">
div
  p Contract
  span.contract-field(v-for="(value, i) in contract" :key='i') 
      .label {{ i }}: {{ value }} 
  router-link(to="/") Home
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { Contract } from 'src/types';

export default defineComponent({
  name: 'ContractComponent',
  props: {
    contract: {
      type: Object as PropType<Contract>,
      required: true
    }
  },
  methods: {
    //example using a method to push route
    goHome() {
      this.$router.push({ name: 'home' }).catch((err: string) => {
        throw new Error(`ROUTER ERROR: ${err}.`);
      });
    }
  }
});
</script>
