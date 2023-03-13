<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useStore } from 'src/store';
import { mapActions } from 'vuex';
import ViewTransaction from 'src/components/ViewTransanction.vue';
import { getChain } from 'src/config/ConfigManager';
import { API } from '@greymass/eosio';
import { StakeResourcesTransactionData } from 'src/types/StakeResourcesTransactionData';

const chain = getChain();
const symbol = chain.getSystemToken().symbol;

export default defineComponent({
    name: 'UnstakeTab',
    components: {
        ViewTransaction,
    },
    setup() {
        const store = useStore();
        const openTransaction = ref<boolean>(false);
        const stakingAccount = ref<string>(
            store.state.account.accountName.toLowerCase() || '',
        );
        const cpuTokens = ref<string>('0');
        const netTokens = ref<string>('0');
        const netStake = computed((): string => (store.state.account.data.self_delegated_bandwidth?.net_weight.value || 0).toString());
        const cpuStake = computed((): string => (store.state.account.data.self_delegated_bandwidth?.cpu_weight.value || 0).toString());

        function formatDec() {
            if (cpuTokens.value !== '0') {
                cpuTokens.value = Number(cpuTokens.value)
                    .toLocaleString('en-US', {
                        style: 'decimal',
                        maximumFractionDigits: store.state.chain.token.precision,
                        minimumFractionDigits: store.state.chain.token.precision,
                    })
                    .replace(/[^0-9.]/g, '');
            }
            if (netTokens.value !== '0') {
                netTokens.value = Number(netTokens.value)
                    .toLocaleString('en-US', {
                        style: 'decimal',
                        maximumFractionDigits: store.state.chain.token.precision,
                        minimumFractionDigits: store.state.chain.token.precision,
                    })
                    .replace(/[^0-9.]/g, '');
            }
        }

        function assetToAmount(asset: string, decimals = -1): number {
            try {
                let qty: string = asset.split(' ')[0];
                let val: number = parseFloat(qty);
                if (decimals > -1) {
                    qty = val.toFixed(decimals);
                }
                return val;
            } catch (error) {
                return 0;
            }
        }

        return {
            openTransaction,
            stakingAccount,
            cpuTokens,
            netTokens,
            ...mapActions({ signTransaction: 'account/sendTransaction' }),
            transactionId: ref<string>(null),
            transactionError: null,
            formatDec,
            netStake: assetToAmount(netStake.value),
            cpuStake: assetToAmount(cpuStake.value),
        };
    },
    computed: {
        cpuInputRules(): Array<(data: string) => boolean | string> {
            return [
                (val: string) => +val >= 0 || 'Value must not be negative',
                (val: string) => +val <= this.cpuStake || 'Not enough staked',
            ];
        },
        netInputRules(): Array<(data: string) => boolean | string> {
            return [
                (val: string) => +val >= 0 || 'Value must not be negative',
                (val: string) => +val <= this.netStake || 'Not enough staked',
            ];
        },
        ctaDisabled(): boolean {
            return this.cpuStake + this.netStake === 0;
        },
    },
    methods: {
        async sendTransaction(): Promise<void> {
            console.log(this.cpuTokens);
            this.transactionError = '';
            if (parseFloat(this.cpuTokens) <= 0 && parseFloat(this.netTokens) <= 0) {
                this.$q.notify('Enter valid value for CPU or NET to unstake');
                return;
            }
            const data = {
                from: this.stakingAccount,
                receiver: this.stakingAccount,
                transfer: false,
                unstake_cpu_quantity:
          parseFloat(this.cpuTokens) > 0
              ? `${parseFloat(this.cpuTokens).toFixed(4)} ${symbol}`
              : `0.0000 ${symbol}`,
                unstake_net_quantity:
          parseFloat(this.netTokens) > 0
              ? `${parseFloat(this.netTokens).toFixed(4)} ${symbol}`
              : `0.0000 ${symbol}`,
            } as StakeResourcesTransactionData;
            try {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                this.transactionId = (
          await this.signTransaction({
              account: 'eosio',
              name: 'undelegatebw',
              data,
          })
        ).transactionId as string;
                this.$store.commit('account/setTransaction', this.transactionId);
            } catch (e) {
                this.transactionError = e;
                this.$store.commit('account/setTransactionError', e);
            }
            await this.loadAccountData();

            if (localStorage.getItem('autoLogin') !== 'cleos') {
                this.openTransaction = true;
            }
        },
        async loadAccountData(): Promise<void> {
            let data: API.v1.AccountObject;
            try {
                data = await this.$api.getAccount(this.stakingAccount);
                this.$store.commit('account/setAccountData', data);
            } catch (e) {
                return;
            }
        },
    },
});
</script>

<template lang="pug">
.staking-form
  q-card-section.text-grey-3.text-weight-light
    .row.q-pb-md
      .col-6
        .row.q-pb-sm
            .col-6 REMOVE CPU
            .col-6
              .color-grey-3.flex.justify-end.items-center( @click="cpuTokens = cpuStake.toString()" )
                span.text-weight-bold.balance-amount {{ cpuStake ? `${cpuStake } AVAILABLE` : '--' }}
                q-icon.q-ml-xs( name="info" )
                q-tooltip Click to fill full amount
        q-input.full-width(standout="bg-deep-purple-2 text-white" @blur='formatDec' placeholder='0' v-model="cpuTokens" :lazy-rules="true"  :rules="cpuInputRules" type="text" dense dark)

      .col-6.q-pl-md
        .row.q-pb-sm
            .col-6 REMOVE NET
            .col-6
              .color-grey-3.flex.justify-end.items-center( @click="netTokens = netStake.toString()" )
                span.text-weight-bold.balance-amount {{ netStake ? `${netStake } AVAILABLE` : '--' }}
                q-icon.q-ml-xs( name="info" )
                q-tooltip Click to fill full amount
        q-input.full-width(standout="bg-deep-purple-2 text-white" @blur='formatDec' placeholder='0'  v-model="netTokens" :lazy-rules="true" :rules="netInputRules" type="text" dense dark)
    .row
      .col-12.q-pt-md
        q-btn.full-width.button-accent(label="Confirm" flat :disable="ctaDisabled" @click="sendTransaction" )
    ViewTransaction(:transactionId="transactionId" v-model="openTransaction" :transactionError="transactionError || ''" message="Transaction complete")

</template>

<style lang="sass">
.button-accent
    background: rgba(108, 35, 255, 1)
    border-radius: 4px
    color: $grey-4
</style>
