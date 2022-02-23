<template lang="pug">
div.row.col-12
    div.row.col-12.gradient-box
    TransactionsTable(:account='block')

</template>
<script lang="ts">
import { defineComponent } from 'vue';
import TransactionsTable from 'components/TransactionsTable.vue';

export default defineComponent({
  name: 'Block',
  data() {
    return {
      block: this.$route.params.block
    };
  },
  components: {
    TransactionsTable
  }
});
</script>
<style lang="sass">
.gradient-box
    min-height: 632px
    width: 100%
    background: linear-gradient(180deg, #071A5F 0%, #571AFF 175.31%)
.price-box-position
    margin-top: -100px
</style>
