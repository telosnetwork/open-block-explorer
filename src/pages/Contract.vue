<template lang="pug">
q-page.row.items-center.justify-evenly
  contract-component(
    :contract='testContract'
  )
</template>

<script lang="ts">
import { Contract } from 'src/types';
import ContractComponent from 'components/ContractComponent.vue';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'PageIndex',
  components: { ContractComponent },
  data(): { testContract: Contract } {
    return {
      testContract: {
        address: '32cxfcjdk3231',
        creator: '1321cdskfdslj',
        abi: ['test', 'test2', 'test3'],
        byteCode: 'FDFDADAD2321334'
      }
    };
  }
});
</script>
