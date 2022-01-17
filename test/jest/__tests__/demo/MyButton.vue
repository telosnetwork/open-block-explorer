
<template>
  <div>
    <p class="content">{{ input }}</p>
    <span>{{ counter }}</span>
    <q-btn class="button" @click="increment()"></q-btn>
  </div>
</template>

<script lang="ts">

export default {
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
};
</script>
