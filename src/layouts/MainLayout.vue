<template lang="pug">
q-layout( view="lHh Lpr lFf" )
  q-header( elevated )
    q-btn(
        flat
        dense
        round
        icon="menu"
        aria-label="Menu"
        @click=""
    )
      q-toolbar-title Header OBE v0.0.0
  ProducerMap
  q-page-container
    router-view 
</template>

<script lang="ts">
import ProducerMap from 'components/ProducerMap.vue';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'MainLayout',

  components: {
    ProducerMap
  },

  data() {
    return {};
  },

  methods: {}
});
</script>
