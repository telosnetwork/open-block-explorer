<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useAntelopeStore } from 'src/store/antelope.store';
import { mapActions } from 'vuex';
import ViewTransaction from 'src/components/ViewTransanction.vue';
import { getChain } from 'src/config/ConfigManager';
import { DelegatedResources } from 'src/store/resources/state';
import { formatCurrency, assetToAmount } from 'src/utils/string-utils';

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

        const delegatedList = computed(() => store.resources.getDelegatedToOthers());
        const isUpdating = computed(() => store.resources.isLoading('updateResources'));
        const isUnstaking = computed(() => store.resources.isLoading('undelegateResources'));
        const loading = computed(() => store.resources.getLoading());
        const selectModel = ref<{label:string, value:DelegatedResources}>({ label: '', value: null });
        const receiverAccount = computed((): string => selectModel.value?.value?.to);

        const selectOptions = computed(() => {
            const options = delegatedList.value?.map(item => ({
                label: item.to,
                value: item,
            })) ?? [];
            return options;
        });

        void store.resources.updateResources({}).then(() => {
            const selfStaked = store.resources.getSelfStaked();
            if (selfStaked) {
                selectModel.value = {
                    label: (selfStaked?.to ?? 'unknown'),
                    value: selfStaked,
                };
            }
        });

        const netStake = ref<number>(0);
        const cpuStake = ref<number>(0);

        return {
            openTransaction,
            stakingAccount,
            receiverAccount,
            selectModel,
            selectOptions,
            delegatedList,
            isUpdating,
            isUnstaking,
            loading,
            cpuTokens,
            netTokens,
            ...mapActions({ undelegateResources: 'resources/undelegateResources' }),
            transactionId: ref<string>(null),
            transactionError: null,
            formatDec,
            assetToAmount,
            netStake,
            cpuStake,
        };
    },
    watch: {
        selectModel: {
            handler() {
                this.update();
            },
            deep: true,
        },
        selectOptions: {
            handler() {
                this.update();
            },
            deep: true,
        },
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
                (val: string) => +val <= this.netStake || `Not enough staked, needed: ${this.netStake}`,
            ];
        },
        ctaDisabled(): boolean {
            return this.cpuStake + this.netStake === 0;
        },
    },
    methods: {
        update(): void {

            const current = this.selectOptions.find(item => item.value.to === (this.selectModel?.value?.to ?? ''));
            if (current) {
                this.selectModel = current;
            }

            this.netStake = this.assetToAmount((this.selectModel.value as DelegatedResources)?.net_weight.toString());
            this.cpuStake = this.assetToAmount((this.selectModel.value as DelegatedResources)?.cpu_weight.toString());
            this.netTokens = '0';
            this.cpuTokens = '0';
        },
        async sendTransaction(): Promise<void> {
            this.transactionError = '';
            if (parseFloat(this.cpuTokens) <= 0 && parseFloat(this.netTokens) <= 0) {
                this.$q.notify('Enter valid value for CPU or NET to unstake');
                return;
            }

            await this.undelegateResources({
                from: this.stakingAccount,
                to: this.receiverAccount,
                transfer: false,
                cpu_weight:
                    parseFloat(this.cpuTokens) > 0
                        ? formatCurrency(parseFloat(this.cpuTokens), 4, symbol, true)
                        : `0.0000 ${symbol}`,
                net_weight:
                    parseFloat(this.netTokens) > 0
                        ? formatCurrency(parseFloat(this.netTokens), 4, symbol, true)
                        : `0.0000 ${symbol}`,
            });

            if (localStorage.getItem('autoLogin_' + getChain().getChainId()) !== 'cleos') {
                this.openTransaction = true;
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
                        <div class="color-grey-3 flex justify-end items-center" @click="cpuTokens = cpuStake.toString()">
                            <span class="text-weight-bold balance-amount">{{ `${cpuStake} AVAILABLE` }}</span>
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
                        <div class="color-grey-3 flex justify-end items-center" @click="netTokens = netStake.toString()">
                            <span class="text-weight-bold balance-amount">{{ `${netStake} AVAILABLE` }}</span>
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
                    :disable="ctaDisabled || isUnstaking"
                    @click="sendTransaction"
                >
                    <q-spinner
                        v-if="isUnstaking"
                        size="20px"
                        color="white"
                        class="q-ml-sm"
                    />
                </q-btn>
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
        .q-field__control:before, .q-field__control:hover:before
            border-bottom: 1px solid white
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

.balance-amount:hover
    cursor: pointer
    color: $primary
</style>
