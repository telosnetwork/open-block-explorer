<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAccountStore } from 'src/stores/account';

export default defineComponent({
    name: 'ViewTransaction',
    props: {
        message: {
            type: String,
            required: true,
        },
    },
    setup(props) {
        const accountStore = useAccountStore();
        const router = useRouter();
        const msg = computed((): string => props.message);
        const Id = computed(() => accountStore.TransactionId);
        const transactionE = computed(() => accountStore.TransactionError);

        const reset = () => {
            void accountStore.resetTransaction();
        };

        const navToTransaction = async () => {
            await router.push({
                name: 'transaction',
                params: { transaction: Id.value },
            });
            router.go(0);
            void accountStore.resetTransaction();
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

<template>
<q-dialog>
    <div class="Card">
        <q-card-section v-if="Id">
            <div class="row">
                <div class="col-12">
                    <div class="row">
                        <div class="text-h6">{{msg}}</div>
                    </div>
                    <div class="row ellipsis-overflow q-pt-lg q-pl-md" @click="navToTransaction">{{ Id }}</div>
                </div>
            </div>
        </q-card-section>
        <q-card-section v-else>
            <div class="row">
                <div class="col-12">
                    <div class="row">Transaction Failed: {{ transactionE }}</div>
                </div>
            </div>
        </q-card-section>
        <q-card-actions class="text-primary" align="right">
            <q-btn
                v-close-popup
                flat
                label="Close"
                text-color="grey-3"
                @click="reset"
            />
            <q-btn
                v-if="Id"
                flat
                label="View transaction"
                text-color="grey-3"
                @click="navToTransaction"
            />
        </q-card-actions>
    </div>
</q-dialog>

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
