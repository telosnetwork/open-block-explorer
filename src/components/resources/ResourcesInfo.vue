<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useStore } from 'src/store';
import { Token } from 'src/types';
import { API } from '@greymass/eosio';
import { getChain } from 'src/config/ConfigManager';

export default defineComponent({
    name: 'ResourcesInfo',
    setup() {
        const store = useStore();
        const openCoinDialog = ref<boolean>(false);
        const stakingAccount = ref<string>('');
        const cpuTokens = ref<string>('0.0000');
        const netTokens = ref<string>('0.0000');
        const total = ref<string>('0.0000');
        const token = ref<Token>(getChain().getSystemToken());
        const accountData = computed((): API.v1.AccountObject => store.state?.account.data);
        const ramPrice = computed((): string => store.state?.chain.ram_price === '0'
            ? '0.0000'
            : store.state.chain.ram_price);
        const ramAvailable = computed(
            () =>
                Number(accountData.value.ram_quota) -
                Number(accountData.value.ram_usage),
        );
        const delegatedResources = computed(() => {
            const totalStakedResources =
                Number(accountData.value.cpu_weight.value) /
                    Math.pow(10, token.value.precision) +
                Number(accountData.value.net_weight.value) /
                    Math.pow(10, token.value.precision);
            const selfStakedResources =
                Number(
                    accountData.value.self_delegated_bandwidth?.net_weight.value
                        ? accountData.value.self_delegated_bandwidth.net_weight.value
                        : '0',
                ) +
                Number(
                    accountData.value.self_delegated_bandwidth?.cpu_weight.value
                        ? accountData.value.self_delegated_bandwidth.cpu_weight.value
                        : '0',
                );
            return totalStakedResources - selfStakedResources;
        });

        const accountTotal = computed(() => {
            let value = 0;
            if (accountData.value) {
                value = accountData.value?.core_liquid_balance?.value ?? 0;
            }
            return value;
        });

        const currentCpu = computed(
            () => accountData.value?.total_resources?.cpu_weight.value,
        );

        const currentNet = computed(
            () => accountData.value?.total_resources?.net_weight.value,
        );

        const totalRefund = computed((): number =>
            accountData.value && accountData.value.refund_request
                ? accountData.value.refund_request.cpu_amount.value +
                accountData.value.refund_request.net_amount.value
                : 0,
        );

        const formatValue = (val: number): string => `${val.toFixed(token.value.precision)} ${token.value.symbol}`;

        return {
            store,
            openCoinDialog,
            stakingAccount,
            cpuTokens,
            netTokens,
            total,
            accountData,
            token,
            ramPrice,
            ramAvailable,
            delegatedResources,
            accountTotal,
            currentCpu,
            currentNet,
            totalRefund,
            formatValue,
        };
    },
});
</script>

<template>

<div class="container grey-3">
    <div class="row full-width">
        <div class="row full-width q-pt-md q-px-lg">
            <div class="col-6 text-h6 text-bold">AVAILABLE BALANCE</div>
            <div class="col-6 text-h6 text-right text-bold">{{ formatValue(accountTotal) }}</div>
        </div>
        <div class="row full-width q-py-md">
            <hr>
        </div>
        <div class="row full-width q-pb-md">
            <div class="col-xs-12 col-sm-6 q-px-lg q-pb-sm">
                <div class="row">
                    <div class="col-7 text-weight-light">CPU</div>
                    <div class="col-5 text-right text-bold">{{ formatValue(currentCpu) }}</div>
                </div>
                <div class="row q-pt-sm">
                    <div class="col-7 text-weight-light">NET</div>
                    <div class="col-5 text-right text-bold">{{ formatValue(currentNet) }}</div>
                </div>
                <div class="row q-pt-sm">
                    <div class="col-7 text-weight-light">AVAILABLE RAM</div>
                    <div class="col-5 text-right text-bold">{{ramAvailable}} Bytes</div>
                </div>
            </div>
            <div class="col-xs-12 col-sm-6 q-px-lg q-pb-sm">
                <div class="row">
                    <div class="col-7 text-weight-light">DELEGATED BY OTHERS</div>
                    <div class="col-5 text-right text-bold">{{ formatValue(delegatedResources) }}</div>
                </div>
                <div class="row q-pt-sm">
                    <div class="col-7 text-weight-light">REFUNDING</div>
                    <div class="col-5 text-right text-bold">{{ formatValue(totalRefund) }}</div>
                </div>
                <div class="row q-pt-sm">
                    <div class="col-7 text-weight-light">RAM PRICE</div>
                    <div class="col-5 text-right text-bold">{{ramPrice}} {{token.symbol}}/KB</div>
                </div>
            </div>
        </div>
    </div>
</div>

</template>

<style scoped lang="sass">
.container
  border: 2px solid $grey-3
  border-radius: 13px
.grey-3
  color: $grey-3
hr
  content: ""
  display: block
  width: 100%
  border-size: 0.5rem
  border : 0px
  border-bottom: 1px solid $grey-8
  margin-left: 1rem
  margin-right: 1rem
</style>
