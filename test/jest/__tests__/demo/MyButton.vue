
<template lang="pug">
  div
    p.content {{ input }}
    span {{ counter }} 
    q-btn.button( @click="increment()" )
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'MyButton',
  props: {
    incrementStep: {
      type: Number,
      default: 1,
    },
  },
  data() {
    return {
      input: 'rocket muffin',
      counter: 0
    }
  },
  methods: {
    increment(): void{
      this.counter += this.incrementStep;
    } 
  }
});
</script>
