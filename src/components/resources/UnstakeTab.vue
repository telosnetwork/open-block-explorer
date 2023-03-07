<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useAntelopeStore } from 'src/store/antelope.store';
import { mapActions } from 'vuex';
import ViewTransaction from 'src/components/ViewTransanction.vue';
import { getChain } from 'src/config/ConfigManager';
import { API } from '@greymass/eosio';
import { DelegatedResources } from 'src/store/resources/state';

const chain = getChain();
const symbol = chain.getSystemToken().symbol;

export default defineComponent({
    name: 'UnstakeTab',
    components: {
        ViewTransaction,
    },
    setup() {
        const store = useAntelopeStore();
        const openTransaction = ref<boolean>(false);
        const stakingAccount = ref<string>(
            store.state.account.accountName.toLowerCase() || '',
        );
        const cpuTokens = ref<string>('0');
        const netTokens = ref<string>('0');
        const netStake = computed((): string =>
            store.state.account.data.total_resources.net_weight.toString(),
        );
        const cpuStake = computed((): string =>
            store.state.account.data.total_resources.cpu_weight.toString(),
        );

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

        const delegatedList = computed(() => store.resources.getDelegatedToOthers());
        const isUpdating = computed(
            () => store.resources.isLoading('updateResources'),
        );

        const selectOptions = ref<{label:string, value:DelegatedResources}[]>([]);
        const selectModel = ref<{label:string, value:DelegatedResources}>({ label: '', value: null });
        const receiverAccount = computed((): string => selectModel.value?.value?.to);

        console.log('store.resources.updateResources() antes');
        void store.resources.updateResources().then(() => {
            const selfStaked = store.resources.getSelfStaked();
            if (selfStaked) {
                selectModel.value = {
                    label: selfStaked?.to,
                    value: selfStaked,
                };
            }

            const options = delegatedList.value?.map(item => ({
                label: item.to,
                value: item,
            })) ?? [];

            // first option should be self staked
            // options.unshift({
            //     label: selfStaked?.to,
            //     value: selfStaked,
            // });

            console.log('------------------------------------');
            console.log(options[0].label);
            console.log(selfStaked);
            console.log('------------------------------------');


            selectOptions.value = options;
        });

        return {
            openTransaction,
            stakingAccount,
            receiverAccount,
            selectModel,
            selectOptions,
            delegatedList,
            isUpdating,
            cpuTokens,
            netTokens,
            ...mapActions({ undelegateResources: 'resources/undelegateResources' }),
            transactionId: ref<string>(null),
            transactionError: null,
            formatDec,
            netStake: assetToAmount(netStake.value),
            cpuStake: assetToAmount(cpuStake.value),
        };
    },
    async mounted() {
        // await this.$store.dispatch('resources/updateResources');
    },
    computed: {
        cpuInputRules(): Array<(data: string) => boolean | string> {
            return [
                (val: string) => +val >= 0 || 'Value must not be negative',
                (val: string) => +val < this.cpuStake || 'Not enough staked',
            ];
        },
        netInputRules(): Array<(data: string) => boolean | string> {
            return [
                (val: string) => +val >= 0 || 'Value must not be negative',
                (val: string) => +val < this.netStake || 'Not enough staked',
            ];
        },
        ctaDisabled(): boolean {
            return this.cpuStake + this.netStake === 0;
        },
    },
    methods: {
        async sendTransaction(): Promise<void> {
            this.transactionError = '';
            if (parseFloat(this.cpuTokens) <= 0 && parseFloat(this.netTokens) <= 0) {
                this.$q.notify('Enter valid value for CPU or NET to unstake');
                return;
            }

            await this.undelegateResources({
                from: this.stakingAccount,
                receiver: this.receiverAccount,
                cpu_weight:
                    parseFloat(this.cpuTokens) > 0
                        ? `${parseFloat(this.cpuTokens).toFixed(4)} ${symbol}`
                        : `0.0000 ${symbol}`,
                net_weight:
                    parseFloat(this.netTokens) > 0
                        ? `${parseFloat(this.netTokens).toFixed(4)} ${symbol}`
                        : `0.0000 ${symbol}`,
            });
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

<template>

<div class="unstake-tab">
    <q-card-section class="text-grey-3 text-weight-light">
        <div class="row q-pb-md">
            <div class="col-12">
                <q-linear-progress v-if="isUpdating" color="primary" />
                <q-select
                    v-else
                    v-model="selectModel"
                    class="full-width unstake-tab__select"
                    color="primary"
                    :options="selectOptions"
                    label="Delegated to"
                    :rules="[val => !!val || 'Delegated to is required']"
                />
            </div>
        </div>
        <div class="row q-pb-md">
            <div class="col-6">
                <div class="row q-pb-sm">
                    <div class="col-6">REMOVE CPU</div>
                    <div class="col-6">
                        <div class="color-grey-3 flex justify-end items-center" @click="cpuTokens = cpuStake.toString()"><span class="text-weight-bold balance-amount">{{ cpuStake ? `${cpuStake } AVAILABLE` : '--' }}</span>
                            <q-icon class="q-ml-xs" name="info"/>
                            <q-tooltip>Click to fill full amount</q-tooltip>
                        </div>
                    </div>
                </div>
                <q-input
                    v-model="cpuTokens"
                    class="full-width"
                    standout="bg-deep-purple-2 text-white"
                    placeholder="0"
                    :lazy-rules="true"
                    :rules="cpuInputRules"
                    type="text"
                    dense
                    dark
                    @blur="formatDec"
                />
            </div>
            <div class="col-6 q-pl-md">
                <div class="row q-pb-sm">
                    <div class="col-6">REMOVE NET</div>
                    <div class="col-6">
                        <div class="color-grey-3 flex justify-end items-center" @click="netTokens = netStake.toString()"><span class="text-weight-bold balance-amount">{{ netStake ? `${netStake } AVAILABLE` : '--' }}</span>
                            <q-icon class="q-ml-xs" name="info"/>
                            <q-tooltip>Click to fill full amount</q-tooltip>
                        </div>
                    </div>
                </div>
                <q-input
                    v-model="netTokens"
                    class="full-width"
                    standout="bg-deep-purple-2 text-white"
                    placeholder="0"
                    :lazy-rules="true"
                    :rules="netInputRules"
                    type="text"
                    dense
                    dark
                    @blur="formatDec"
                />
            </div>
        </div>
        <div class="row">
            <div class="col-12 q-pt-md">
                <q-btn
                    class="full-width button-accent"
                    label="Confirm"
                    flat
                    :disable="ctaDisabled"
                    @click="sendTransaction"
                />
            </div>
        </div>
        <ViewTransaction
            v-model="openTransaction"
            :transactionId="transactionId"
            :transactionError="transactionError || ''"
            message="transaction complete"
        />
    </q-card-section>
</div>
</template>

<style lang="sass">
.button-accent
    background: rgba(108, 35, 255, 1)
    border-radius: 4px
    color: $grey-4

.unstake-tab
    &__select
        color: white
        .q-field__marginal
            color: white
        .q-field__native
            color: white
            border: none
            border-bottom: 1px solid white
            border-radius: 0
            padding: 0
            &:focus
                border-bottom: 1px solid white
                border-radius: 0
                outline: none
                box-shadow: none
        .q-field__label
            color: #9e9e9e
        &.q-field--highlighted
            .q-field__label
                color: white
</style>
