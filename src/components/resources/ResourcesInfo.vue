<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { Token } from 'src/types';
import { API } from '@greymass/eosio';
import { getChain } from 'src/config/ConfigManager';
import { formatCurrency } from 'src/utils/string-utils';
import { useAccountStore } from 'src/stores/account';
import { useChainStore } from 'src/stores/chain';
import { useResourceStore } from 'src/stores/resources';

export default defineComponent({
    name: 'ResourcesInfo',
    setup() {
        const accountStore = useAccountStore();
        const chainStore = useChainStore();
        const resourceStore = useResourceStore();
        const openCoinDialog = ref<boolean>(false);
        const stakingAccount = ref<string>('');
        const cpuTokens = ref<string>('0');
        const netTokens = ref<string>('0');
        const total = ref<string>('0');
        const token = ref<Token>(getChain().getSystemToken());
        const accountData = computed(() => accountStore.data as API.v1.AccountObject);
        const ramPrice = computed((): string => chainStore.ram_price === '0' ? '0' : chainStore.ram_price);
        const ramAvailable = computed(() =>
            Number(accountData.value.ram_quota) -
            Number(accountData.value.ram_usage),
        );
        const delegatedByOthers = computed(() => {
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
        const delegatedToOthers = computed(() => resourceStore.toOthersAggregated);

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
            (accountData.value?.refund_request?.cpu_amount.value ?? 0) +
            (accountData.value?.refund_request?.net_amount.value ?? 0),
        );

        const formatValue = (val: number): string => formatCurrency(val || 0, token.value.precision, token.value.symbol);

        return {
            openCoinDialog,
            stakingAccount,
            cpuTokens,
            netTokens,
            total,
            accountData,
            token,
            ramPrice,
            ramAvailable,
            delegatedByOthers,
            delegatedToOthers,
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
                    <div class="col-5 text-right text-bold">{{ formatValue(delegatedByOthers) }}</div>
                </div>
                <div class="row q-pt-sm">
                    <div class="col-7 text-weight-light">DELEGATED TO OTHERS</div>
                    <div class="col-5 text-right text-bold">{{ formatValue(delegatedToOthers) }}</div>
                </div>
                <div class="row q-pt-sm">
                    <div class="col-7 text-weight-light">REFUNDING</div>
                    <div class="col-5 text-right text-bold">{{ formatValue(totalRefund) }}</div>
                </div>
                <!--div class="row q-pt-sm">
                    <div class="col-7 text-weight-light">RAM PRICE</div>
                    <div class="col-5 text-right text-bold">{{ramPrice}} {{token.symbol}}/KB</div>
                </div-->
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
