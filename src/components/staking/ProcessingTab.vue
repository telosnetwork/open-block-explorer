<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { Token } from 'src/types';
import { API } from '@greymass/eosio';
import { useAccountStore } from 'src/stores/account';
import { useChainStore } from 'src/stores/chain';

export default defineComponent({
    name: 'ProcessingTab',
    components: {
    },
    setup() {
        const chainStore = useChainStore();
        const accountStore = useAccountStore();
        const progress = ref<number>(0.2);
        const token = computed((): Token => chainStore.token);
        const accountData = computed(() => accountStore.data as API.v1.AccountObject);
        const maturingRex = computed(() => accountStore.maturingRex);

        function refundProgress(): number {
            if (maturingRex.value === '0') {
                return 0;
            }
            let diff =
                Math.round(
                    new Date(
                        new Date(
                            accountData.value?.refund_request?.request_time.toString() + 'Z',
                        ).toUTCString(),
                    ).getTime() / 1000,
                ) +
                604800 - //The max amount it can take in seconds
                Math.round(new Date(Date.now()).getTime() / 1000);
            let time = diff / 604800;
            return time > 0 ? time : 0.01;
        }

        function maturitiesCountdown(): string {
            if (maturingRex.value === '0') {
                return 'No maturing TLOS';
            }
            let diff =
                Math.round(
                    new Date(
                        new Date(
                            accountData.value?.rex_info?.rex_maturities[0].first.toString() +
                        'Z',
                        ),
                    ).getTime() / 1000,
                ) - Math.round(new Date(new Date().toISOString()).getTime() / 1000);
            if (diff > 0) {
                const days = component(diff, 24 * 60 * 60), // calculate days from timestamp
                    hours = component(diff, 60 * 60) % 24; // hours
                // minutes = component(diff, 60) % 60, // minutes
                // seconds = component(diff, 1) % 60;// seconds
                return `${days} days, ${hours} hours remaining`;
            } else {
                return 'No maturing Rex';
            }
        }

        function component(x: number, v: number) {
            return Math.floor(x / v);
        }

        return {
            accountData,
            token,
            progress,
            refundProgress,
            maturitiesCountdown,
            maturingRex,
            transactionId: ref<string>(null),
            transactionError: null,
        };
    },
});
</script>

<template>
<div class="q-pt-lg">
    <div class="container-refund q-pa-sm">
        <div class="row full-width">
            <div class="col-xs-12 col-sm-6">
                <div class="row q-pa-sm">
                    <div class="col-6">Staked TLOS maturing</div>
                    <div class="col-6 text-right text-weight-bold">{{maturingRex}}</div>
                </div>
            </div>
            <div class="col-xs-12 col-sm-6">
                <div class="row q-pa-sm">
                    <div class="col-7">{{maturitiesCountdown()}}</div>
                    <div class="col-5 text-right text-weight-bold">
                        <q-linear-progress class="q-mt-sm" :value="refundProgress()" color="grey-3"/>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

</template>

<style lang="sass">
.button-accent
    background: rgba(108, 35, 255, 1)
    border-radius: 4px
    color: $grey-4
.container-refund
  border: 1px solid $grey-8
  border-radius: 13px
.grey-3
  color: $grey-3
</style>
