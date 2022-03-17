<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'LoginHandlerDropdown',
  props: ['account']
});
</script>
<template lang="pug">
q-btn-dropdown.connect-button( color='primary' :label='account')
WalletModal(:showModal='false')
</template>
<style lang="sass">
.connect-button
  text-transform: lowercase
</style>
