<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useStore } from 'src/store';
import { useRouter } from 'vue-router';

export default defineComponent({
    name: 'ViewTransaction',
    props: {
        message: {
            type: String,
            required: true,
        },
    },
    setup(props) {
        const store = useStore();
        const router = useRouter();
        const msg = computed((): string => props.message);
        const Id = computed(() => store.state.account.TransactionId);
        const transactionE = computed(() => store.state.account.TransactionError);

        const reset = () => {
            void store.dispatch('account/resetTransaction');
        };

        const navToTransaction = async () => {
            await router.push({
                name: 'transaction',
                params: { transaction: Id.value },
            });
            router.go(0);
            void store.dispatch('account/resetTransaction');
        };

        return {
            msg,
            Id,
            transactionE,
            reset,
            navToTransaction,
        };
    },
});
</script>

<template lang="pug">
q-dialog
  .Card
    q-card-section(v-if='Id')
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
      q-btn(flat label="Close" @click="reset" v-close-popup text-color="grey-3")
      q-btn(flat label="View transaction" @click="navToTransaction" text-color="grey-3" v-if="Id")

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
