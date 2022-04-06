<script lang="ts">
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'SendDialog',
  props: {
    message: {
      type: String,
      required: true
    },
    transactionId: {
      type: String
    },
    transactionError: {
      type: String
    }
  },
  setup(props) {
    const msg = computed((): string => props.message);
    const Id = computed((): string => props.transactionId);
    const transactionE = computed((): string => props.transactionError);

    return {
      msg,
      Id,
      transactionE
    };
  },
  methods: {
    async navToTransaction() {
      await this.$router.push({
        name: 'transaction',
        params: { transaction: this.Id }
      });
      this.$router.go(0);
    }
  }
});
</script>

<template lang="pug">
q-dialog
  .Card
    q-card-section(v-if='transactionId')
      .row
        .col-12 
          .row
            .text-h6 {{msg}}
          .row.ellipsis-overflow.q-pt-lg.q-pl-md(@click='navToTransaction') {{ Id }}            
    q-card-section(v-else)
      .row
        .col-12 
          .row Transaction Failed: {{ transactionE }}
    q-card-actions(align="right" class="text-primary")
      q-btn(flat label="Close" v-close-popup text-color="grey-3")
      q-btn(flat label="View Transaction" @click="this.navToTransaction" text-color="grey-3" v-if="transactionE === ''")

</template>

<style lang="sass" scoped>

.Card
  color: $grey-3
  background: rgba(84, 0, 253, 1)
  .send-icon
    padding-bottom: 30px
  .color-grey-3
    color: $grey-3
</style>
