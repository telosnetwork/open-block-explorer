<template lang="pug">
q-item(
  clickable
  tag="a"
  target="_blank"
  :href="link"
)
  q-item-section(
    v-if="icon"
    avatar
  )
    q-icon( :name="icon" )

  q-item-section
    q-item-label {{ title }}
    q-item-label( caption ) {{ caption }}
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'EssentialLink',
  props: {
    title: {
      type: String,
      required: true
    },

    caption: {
      type: String,
      default: ''
    },

    link: {
      type: String,
      default: '#'
    },

    icon: {
      type: String,
      default: ''
    }
  },
  mounted() {
    console.log(process.env.ENV_TYPE);
    console.log(this.$hyperion);
  }
});
</script>
