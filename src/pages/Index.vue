<template lang="pug">
q-page.row.items-center.justify-evenly
  example-component(
    title="Example component"
    active
    :todos="todos"
    :meta="meta"
  )
</template>

<script lang="ts">
import { Todo, Meta } from 'src/types';
import ExampleComponent from 'components/OptionsComponent.vue';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'PageIndex',
  components: { ExampleComponent },
  data(): { todos: Todo[]; meta: Meta } {
    return {
      todos: [
        {
          id: 1,
          content: 'ct1'
        },
        {
          id: 2,
          content: 'ct2'
        },
        {
          id: 3,
          content: 'ct3'
        },
        {
          id: 4,
          content: 'ct4'
        },
        {
          id: 5,
          content: 'ct5'
        }
      ],
      meta: {
        totalCount: 1200
      }
    };
  }
});
</script>
