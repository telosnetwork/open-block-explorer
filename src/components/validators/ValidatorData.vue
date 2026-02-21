<script lang="ts">
import { defineComponent, computed, ref, onMounted, watch } from 'vue';
import ValidatorDataTable from 'src/components/validators/ValidatorDataTable.vue';
import { api } from 'src/api';
import ViewTransaction from 'src/components/ViewTransanction.vue';
import { GetTableRowsParams } from 'src/types';
import WalletModal from 'src/components/WalletModal.vue';
import { getChain } from 'src/config/ConfigManager';
import { Name } from '@wharfkit/session';
import { formatCurrency, assetToAmount } from 'src/utils/string-utils';
import { useAccountStore } from 'src/stores/account';
import { useChainStore } from 'src/stores/chain';

const chain = getChain();

export default defineComponent({
    name: 'ValidatorData',
    components: {
        ValidatorDataTable,
        ViewTransaction,
        WalletModal,
    },
    setup() {
        const accountStore = useAccountStore();
        const chainStore = useChainStore();
        const symbol = chain.getSystemToken().symbol;
        const account = computed(() => accountStore.accountName);
        const balance = computed(
            () => formatCurrency(lastWeight.value, 2, symbol),
        );
        const activecount = computed(() => {
            if (chainStore.producers.length > 35) {
                return 35;
            } else {
                return chainStore.producers.length;
            }
        });
        const lastUpdated = ref<string>('');
        const producerVotes = ref<Name[]>([]);
        const currentVote = computed(() => accountStore.vote);
        const showCpu = ref<boolean>(false);
        const voteChanged = ref<boolean>(false);
        const resetFlag = ref<boolean>(false);
        const lastWeight = ref<number>(0);
        const lastStaked = ref<number>(0);
        const stakedAmount = ref<number>(0);
        const accountValid = computed(() => account.value && account.value !== '');
        const transactionId = ref<string>(accountStore.TransactionId);
        const transactionError = ref<unknown>(accountStore.TransactionError);
        const openTransaction = ref<boolean>(false);
        const showWalletModal = ref<boolean>(false);
        const payrate = ref(0);
        const top21pay24h = ref(0);
        const supply = ref(0);
        const voters = ref(0);
        const amount_voted = ref(0);
        const votesProgress = computed(() => amount_voted.value / supply.value || 0);

        async function getVotingStatistics() {
            await getVoteWeight();
            await updateVoteAmount();
            await updateSupply();
            await updatePayRate();
        }

        async function getVoteWeight() {
            const paramsVoteWeight = {
                code: 'eosio',
                scope: 'eosio',
                table: 'voters',
                lower_bound: Name.from(account.value),
                limit: 1,
            } as GetTableRowsParams;
            lastWeight.value = (
        (await api.getTableRows(paramsVoteWeight)) as {
          rows: { last_vote_weight: number }[];
        }
            ).rows[0].last_vote_weight;
        }

        async function updatePayRate() {
            const sharecount = activecount.value <= 21 
                ? ((activecount.value / 2.0) * (2.0 * 1.2 - (activecount.value - 1) * 0.02) * 2.0) 
                : (42.0 + ((activecount.value - 21) / 2.0) * (2.0 * 1.2 - (activecount.value - 22) * 0.02));
            
            const paramsPayrate = {
                code: 'delphioracle',
                scope: 'tlosusd',
                table: 'averages',
            } as GetTableRowsParams;
         
            const tlosusd = (
                (await api.getTableRows(paramsPayrate)) as {
                    rows: { value: number }[];
                }
            ).rows[0].value;
            
            // Calculate base value using the formula
            const baseValue = Math.min(
                ((189000 * 12) / 365) * Math.pow(tlosusd / 10000.0, -0.516),
                ((315000 * 12) / 365)
            );
            
            // Apply sharecount division and multiply by 10000
            top21pay24h.value = (baseValue * 2) / sharecount;
        }

        async function updateSupply() {
            const paramsSupply = {
                code: 'eosio.token',
                scope: chain.getSystemToken().symbol,
                table: 'stat',
            } as GetTableRowsParams;
            supply.value = assetToAmount(
                (
          (await api.getTableRows(paramsSupply)) as {
            rows: { supply: string }[];
          }
                ).rows[0].supply,
            );
        }

        async function updateVoteAmount() {
            const request = {
                code: 'eosio',
                lower_bound: 'eosio',
                table: 'voters',
            };
            voters.value = (await api.getTableByScope(request))[0].count;
            const totalStakeParams = {
                code: 'eosio',
                scope: 'eosio',
                table: 'global',
            } as GetTableRowsParams;
            amount_voted.value =
        (
          (await api.getTableRows(totalStakeParams)) as {
            rows: { total_activated_stake: number }[];
          }
        ).rows[0].total_activated_stake / 10000;
        }

        function toggleView() {
            showCpu.value = !showCpu.value;
        }
        async function sendVoteTransaction() {
            if (accountValid.value) {
                await accountStore.sendVoteTransaction();
                openTransaction.value = true;
                await getVoteWeight();
            } else {
                showWalletModal.value = true;
            }
        }

        watch(activecount, () => {
            void getVotingStatistics();
        });

        onMounted(async () => {
            await getVotingStatistics();
        });

        return {
            account,
            lastUpdated,
            producerVotes,
            showCpu,
            voteChanged,
            resetFlag,
            lastWeight,
            lastStaked,
            stakedAmount,
            currentVote,
            accountValid,
            openTransaction,
            transactionId,
            transactionError,
            payrate,
            top21pay24h,
            supply,
            voters,
            amount_voted,
            votesProgress,
            balance,
            showWalletModal,
            symbol,
            toggleView,
            sendVoteTransaction,
        };
    },
});
</script>

<template>
<div class="q-pa-md header-support">
    <div class="row q-col-gutter-md q-pt-md container-max-width">
        <div class="col-md-8 col-sm-12 col-xs-12">
            <q-card class="full-height" >
                <q-card-section>
                    <div class="row q-pa-md text-h5 text-weight-light">Voting Statistics</div>
                    <div class="row q-pa-md">
                        <div class="col-12">
                            <q-linear-progress
                                class="gradient-color q-mt-sm"
                                size="120px"
                                rounded
                                :value="votesProgress"
                            />
                        </div>
                    </div>
                    <div class="row q-pa-md">
                        <div class="col-12">
                            <div class="row">
                                <div class="col-6 text-uppercase text-grey">Total votes</div>
                                <div class="col-6">
                                    <div class="float-right text-uppercase text-grey">Total Supply</div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-6">{{ amount_voted.toLocaleString(undefined, {minimumFractionDigits: 4,maximumFractionDigits: 4,}) }}</div>
                                <div class="col-6">
                                    <div class="float-right">{{ supply.toLocaleString(undefined, {minimumFractionDigits: 4,maximumFractionDigits: 4,}) }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </q-card-section>
            </q-card>
        </div>
        <div v-if="accountValid" class="col-md-4 col-sm-12 col-xs-12">
            <q-card>
                <q-card-section>
                    <div class="row full-width justify-center">
                        <div class="text-h6 q-py-md text-weight-regular text-grey">Current Vote Weight</div>
                        <q-icon
                            class="info-icon"
                            name="info"
                            color="white"
                            size="20px"
                        >
                            <q-tooltip anchor="top middle" self="bottom middle" :offset="[10, 10]">Voting is inversley weighted and increases the more validators you vote for (up to 30).</q-tooltip>
                        </q-icon>
                    </div>
                    <div class="row full-width justify-center text-h5">{{ balance }}</div>
                    <div class="row full-width justify-center text-h6 q-py-md text-weight-regular text-grey">{{account}}</div>
                </q-card-section>
                <q-separator />
                <q-card-section>
                    <div class="row full-width justify-center subtitle2 q-py-md text-weight-regular text-grey q-pt-lg">SELECTED {{currentVote.length}} BLOCK PRODUCERS</div>
                    <div class="row full-width justify-center">
                        <q-btn
                            class="full-width q-pa-sm"
                            label="Vote for Block Producers"
                            color="primary"
                            @click="sendVoteTransaction"
                        />
                    </div>
                </q-card-section>
            </q-card>
        </div>

        <div v-else class="col-md-4 col-sm-12 col-xs-12">
            <q-card class="full-height">
                <q-card-section class="full-height">
                    <div class="column justify-center full-height">
                        <div class="row">
                            <div class="col-12 subtitle2 q-pb-md text-weight-regular text-grey q-pt-lg text-center">SELECTED {{currentVote.length}} BLOCK PRODUCERS</div>
                            <div class="col-12">
                                <q-btn
                                    class="full-width q-pa-sm"
                                    label="Vote for Block Producers"
                                    color="primary"
                                    @click="sendVoteTransaction"
                                />
                            </div>
                        </div>
                    </div>
                </q-card-section>
            </q-card>
        </div>
    </div>
</div>
<div class="container-max-width">
    <ValidatorDataTable ref="ValidatorDataTable" :top21pay24h="top21pay24h"/>
    <ViewTransaction
        v-model="openTransaction"
        :transactionId="transactionId"
        :transactionError="transactionError || ''"
        message="transaction complete"
    />
</div>
<WalletModal v-model="showWalletModal"/>
</template>

<style lang="sass" scoped>
.header-support
  height: auto

.card-gradient
  background: var(--q-color-secondary-gradient)
  color: white

.info-icon
  display: inline-block
  margin-top: auto
  margin-bottom: auto
  margin-left: 0.5rem
</style>
