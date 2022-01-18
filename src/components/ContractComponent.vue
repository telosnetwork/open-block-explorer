<template lang="pug">
div
    p Contract
    span.contract-field(v-for="(value, i) in contract" :key='i') 
        .label {{ i }}: {{ value }} 
    q-btn( label='Go Home (calling router instance with named path)' @click="goHome")
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
    goHome() {
      this.$router.push({ name: 'home' }).catch((err: string) => {
        throw new Error(`ROUTER ERROR: ${err}.`);
      });
    }
  }
});
</script>
