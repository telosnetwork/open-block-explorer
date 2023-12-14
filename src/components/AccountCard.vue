<script lang="ts">
import { Token, GetTableRowsParams, RexbalRows, RexPoolRows } from 'src/types';
import { defineComponent, computed, ref, onMounted, watch } from 'vue';
import { useAntelopeStore } from 'src/store/antelope.store';
import PercentCircle from 'src/components/PercentCircle.vue';
import SendDialog from 'src/components/SendDialog.vue';
import ResourcesDialog from 'src/components/resources/ResourcesDialog.vue';
import StakingDialog from 'src/components/staking/StakingDialog.vue';
import DateField from 'src/components/DateField.vue';
import { date, useQuasar } from 'quasar';
import { copyToClipboard } from 'quasar';
import { getChain } from 'src/config/ConfigManager';
import { api } from 'src/api';
import { useRouter } from 'vue-router';
import { TableIndexType } from 'src/types/Api';
import { API, UInt64 } from '@greymass/eosio';
import { formatCurrency } from 'src/utils/string-utils';
import ConfigManager from 'src/config/ConfigManager';

const chain = getChain();
export default defineComponent({
    name: 'AccountCard',
    components: {
        PercentCircle,
        SendDialog,
        ResourcesDialog,
        DateField,
        StakingDialog,
    },
    props: {
        account: {
            type: String,
            required: true,
        },
    },
    setup(props) {
        const $q = useQuasar();
        const router = useRouter();
        const store = useAntelopeStore();

        const accountPageSettings = computed(() => ConfigManager.get().getCurrentChain().getUiCustomization().accountPageSettings);

        const createTime = ref<string>('2019-01-01T00:00:00.000');
        const createTransaction = ref<string>('');
        const creatingAccount = ref('');
        const system_account = ref('eosio');

        const isLoading = ref<boolean>(true);
        const tokensLoading = ref<boolean>(true);
        const none = ref<UInt64>(UInt64.from(0));
        const MICRO_UNIT = ref<number>(Math.pow(10, -6));
        const KILO_UNIT = ref<number>(Math.pow(10, 3));
        const MEGA_UNIT = ref<number>(Math.pow(10, 6));
        const GIGA_UNIT = ref<number>(Math.pow(10, 9));
        const netUnit = ref<string>('kb');
        const ramUnit = ref<string>('kb');
        const resources = ref<number>(0);
        const delegatedByOthers = ref<number>(0.0);
        const delegatedToOthers = computed(
            (): number => store.resources.getDelegatedToOthersAggregated(),
        );
        const rexStaked = ref<number>(0);
        const rexProfits = ref<number>(0);
        const rexDeposits = ref<number>(0);
        const rex = computed(
            (): number => rexStaked.value + rexProfits.value + rexDeposits.value,
        );
        const usdPrice = ref<number>();
        const stakedCPU = ref<number>(0);
        const stakedNET = ref<number>(0);
        const cpu_used = ref<number>(0);
        const cpu_max = ref<number>(0);
        const totalTokens = ref<number | string>('');
        const net_used = ref(0);
        const net_max = ref(0);
        const ram_used = ref(0);
        const ram_max = ref(0);
        const radius = ref(44);
        const stakedResources = ref(0);

        const accountExists = ref<boolean>(true);
        const openSendDialog = ref<boolean>(false);
        const openResourcesDialog = ref<boolean>(false);
        const openStakingDialog = ref<boolean>(false);

        const accountData = ref<API.v1.AccountObject>();
        const availableTokens = ref<Token[]>([]);


        const stakedRefund = computed((): number =>
            (accountData.value?.refund_request?.cpu_amount.value ?? 0) +
            (accountData.value?.refund_request?.net_amount.value ?? 0),
        );

        const staked = computed((): number => stakedRefund.value + stakedNET.value + stakedCPU.value);

        const token = computed((): Token => store.state.chain.token);

        const liquidNative = computed((): number => accountData.value?.core_liquid_balance?.value
            ? accountData.value.core_liquid_balance.value
            : 0);

        const totalValue = computed((): number => {
            if (typeof totalTokens.value === 'number') {
                return usdPrice.value * totalTokens.value;
            }
            return 0;
        });

        const totalValueString = computed((): string => {
            let result = '';

            const usd = formatCurrency(totalValue.value ?? 0, 2);
            const tokenPrice = formatCurrency(usdPrice.value ?? 0, 4);

            if (totalValue.value && usdPrice.value) {
                result = `$${usd} (@ $${tokenPrice}/${chain.getSystemToken().symbol})`;
            }
            return result;
        });

        const isAccount = computed((): boolean => store.state.account.accountName === props.account);

        const createTimeFormat = computed((): string =>
            date.formatDate(createTime.value, 'DD MMMM YYYY @ hh:mm A'),
        );

        const setToken = (value: Token) => {
            void store.commit('chain/setToken', value);
        };

        const loadAccountData = async (): Promise<void> => {
            try {
                isLoading.value = true;
                accountData.value = await api.getAccount(props.account);
                await loadAccountCreatorInfo();
                await loadBalances();
                loadResources();
                setTotalBalance();
                await updateTokenBalances();
                await updateResources({ account: props.account, force: true });
            } catch (e) {
                $q.notify(`account ${props.account} not found!`);
                accountExists.value = false;
                return;
            }
        };

        const loadBalances = async () => {
            try {
                const total  = await getRexBalance();
                rexDeposits.value = await getRexFund();
                rexStaked.value = total;
            } catch (e) {
                $q.notify('REX information not available!');
            }
        };

        const determineUnit = (size: number) => {
            if (size > GIGA_UNIT.value) {
                return {
                    unit: 'gb',
                    denominator: GIGA_UNIT.value,
                };
            }
            if (size > MEGA_UNIT.value) {
                return {
                    unit: 'mb',
                    denominator: MEGA_UNIT.value,
                };
            }
            return {
                unit: 'kb',
                denominator: KILO_UNIT.value,
            };
        };

        const loadResources = () => {
            let ramDenominator;
            if (props.account !== system_account.value) {
                // display max resource unit value for readability
                const ramMaxNumber = Number(accountData.value.ram_quota);
                const ramUnitResult = determineUnit(ramMaxNumber);
                ramDenominator = ramUnitResult.denominator;
                ramUnit.value = ramUnitResult.unit;
                // get displayed number value
                ram_max.value = fixDec(
                    ramMaxNumber / ramDenominator,
                );
                // get units
                const netUsedNumber = Number(accountData.value.net_limit.used);
                const netMaxNumber = Number(accountData.value.net_limit.max);
                const netUnitResult = determineUnit(netMaxNumber);
                const netDenominator = netUnitResult.denominator;
                netUnit.value = netUnitResult.unit;
                net_used.value = fixDec(
                    netUsedNumber / netDenominator,
                );
                net_max.value = fixDec(
                    netMaxNumber / netDenominator,
                );
                cpu_used.value = fixDec(
                    Number(accountData.value.cpu_limit.used) * MICRO_UNIT.value,
                );
                cpu_max.value = fixDec(
                    Number(accountData.value.cpu_limit.max) * MICRO_UNIT.value,
                );
                stakedResources.value =
                    Number(accountData.value.total_resources.cpu_weight.value) +
                    Number(accountData.value.total_resources.net_weight.value);

                stakedCPU.value = Number(
                    accountData.value.self_delegated_bandwidth?.cpu_weight.value || 0,
                );

                stakedNET.value = Number(
                    accountData.value.self_delegated_bandwidth?.net_weight.value || 0,
                );

                delegatedByOthers.value = Math.abs(
                    stakedResources.value - stakedNET.value - stakedCPU.value,
                );
            }
            const ramUsedNumber = Number(accountData.value.ram_usage);
            // only change denominator and units if wasn't already set
            if (!ramDenominator) {
                const ramUnitResult = determineUnit(ramUsedNumber);
                ramDenominator = ramUnitResult.denominator;
                ramUnit.value = ramUnitResult.unit;
            }
            ram_used.value = fixDec(
                ramUsedNumber / ramDenominator,
            );
        };

        const setTotalBalance = () => {
            totalTokens.value = liquidNative.value + rex.value + staked.value + delegatedToOthers.value;
            isLoading.value = false;
        };

        const updateTokenBalances = async () => {
            tokensLoading.value = true;
            availableTokens.value = await api.getTokens(props.account);
            tokensLoading.value = false;
        };

        const loadAccountCreatorInfo = async () => {
            try {
                const creatorData = (await api.getCreator(props.account)) as {
                    creator: string;
                    timestamp: string;
                    trx_id: string;
                };
                creatingAccount.value = creatorData.creator;
                createTime.value = creatorData.timestamp;
                createTransaction.value = creatorData.trx_id;
            } catch (e) {
                $q.notify(`creator account for ${props.account} not found!`);
            }
        };

        const updateResources = (payload: {account:string, force: boolean}) =>
            store.resources.updateResources(payload);

        const getRexFund = async () => {
            const paramsrexfund = {
                code: 'eosio',
                limit: '1',
                lower_bound: props.account as unknown as TableIndexType,
                scope: 'eosio',
                table: 'rexfund',
                reverse: false,
                upper_bound: props.account as unknown as TableIndexType,
            } as GetTableRowsParams;
            const rexfund = (
                (await api.getTableRows(paramsrexfund)) as {
                    rows: {
                        owner: string;
                        balance: string;
                    }[];
                }
            ).rows[0];

            const rexFundBalance =
                rexfund && rexfund.balance
                    ? Number(rexfund.balance.split(' ')[0])
                    : 0.0;
            return rexFundBalance;
        };

        const getRexBalance = async () => {
            const paramsrexbal = {
                code: 'eosio',
                limit: '2',
                lower_bound: props.account as unknown as TableIndexType,
                scope: 'eosio',
                table: 'rexbal',
                reverse: false,
                upper_bound: props.account as unknown as TableIndexType,
            } as GetTableRowsParams;

            const rexBal = ((await api.getTableRows(paramsrexbal)) as RexbalRows)
                .rows[0];

            const totalRexBalance =
                rexBal?.rex_balance
                    ? Number(rexBal.rex_balance.split(' ')[0])
                    : 0;

            const paramsrexpool = {
                code: 'eosio',
                scope: 'eosio',
                table: 'rexpool',
                json: true,
                reverse: false,
            } as GetTableRowsParams;

            const rexpool = ((await api.getTableRows(paramsrexpool)) as RexPoolRows)
                .rows[0];

            const totalRex = Number(rexpool.total_rex.split(' ')[0]);
            const totalLendable = Number(rexpool.total_lendable.split(' ')[0]);
            const tlosRexRatio = totalRex > 0 ? totalLendable / totalRex : 1;

            const total = totalRex > 0 ? tlosRexRatio * totalRexBalance : 0.0;
            return total;
        };

        const fixDec = (val: number): number => Math.abs(parseFloat(val.toFixed(3)));

        const loadSystemToken = (): void => {
            if (token.value.symbol === '') {
                setToken(chain.getSystemToken());
            }
        };

        const loadCreatorAccount = async (): Promise<void> => {
            await router.push({
                name: 'account',
                params: {
                    account: creatingAccount.value,
                },
            });
            router.go(0);
        };

        const loadCreatorTransaction = async (): Promise<void> => {
            await router.push({
                name: 'transaction',
                params: {
                    transaction: createTransaction.value,
                },
            });
            router.go(0);
        };

        const copy = (value: string) => {
            copyToClipboard(value)
                .then((): void => {
                    $q.notify({
                        color: 'green-4',
                        textColor: 'white',
                        message: 'Copied to clipboard',
                        timeout: 1000,
                    });
                })
                .catch(() => {
                    $q.notify({
                        color: 'red-8',
                        textColor: 'white',
                        message: 'Could not copy',
                        timeout: 1000,
                    });
                });
        };

        const formatAsset = (val: number | string): string => {
            if (typeof val === 'undefined') {
                return '--';
            }
            console.assert(typeof val === 'number' || typeof val === 'string', val);
            return typeof val === 'string'
                ? val
                : formatCurrency(val, 4, chain.getSystemToken().symbol);
        };

        const resetBalances = () => {
            totalTokens.value = '--';
            stakedResources.value = delegatedByOthers.value = 0;
            rexStaked.value = 0;
            rexDeposits.value = 0;
        };

        onMounted(async () => {
            usdPrice.value = await chain.getUsdPrice();
            await loadAccountData();
            await store.dispatch('account/updateRexData', {
                account: props.account,
            });
            loadSystemToken();
            void store.dispatch('chain/updateRamPrice');
        });

        watch(
            () => props.account,
            async () => {
                resetBalances();
                await loadAccountData();
                await store.dispatch('account/updateRexData', {
                    account: props.account,
                });
            },
        );

        watch(
            () => store.resources.getDelegatedToOthersAggregated(),
            () => {
                setTotalBalance();
            },
        );

        return {
            accountPageSettings,
            netUnit,
            ramUnit,
            stakedCPU,
            stakedNET,
            cpu_used,
            cpu_max,
            net_used,
            net_max,
            ram_used,
            ram_max,
            creatingAccount,
            isLoading,
            tokensLoading,
            liquidNative,
            stakedRefund,
            totalTokens,
            totalValue,
            totalValueString,
            rex,
            rexStaked,
            rexDeposits,
            none,
            system_account,
            radius,
            availableTokens,
            createTime,
            createTransaction,
            openSendDialog,
            openResourcesDialog,
            openStakingDialog,
            delegatedByOthers,
            delegatedToOthers,
            isAccount,
            token,
            createTimeFormat,
            resources,
            accountExists,
            loadAccountData,
            setToken,
            fixDec,
            loadSystemToken,
            loadCreatorAccount,
            loadCreatorTransaction,
            copy,
            formatAsset,
            updateTokenBalances,
        };
    },
});
</script>

<template>

<div class="q-pa-md">
    <q-card v-if="accountExists" class="account-card">
        <q-card-section class="resources-container">
            <div class="inline-section">
                <div class="row justify-center full-height items-center">
                    <div v-if="account !== system_account" class="col-6">
                        <div class="text-title">{{ account }}</div>
                    </div>
                    <div v-else class="col-2">
                        <div class="text-title">{{ account }}</div>
                    </div>
                    <div class="col-1">
                        <q-btn
                            class="float-right"
                            flat
                            round
                            color="white"
                            icon="content_copy"
                            size="sm"
                            @click="copy(account)"
                        />
                    </div>
                </div>
                <div
                    v-if="creatingAccount && creatingAccount !== '__self__'"
                    class="text-subtitle"
                >
                    created by
                    <span>&nbsp;<a @click="loadCreatorAccount">{{ creatingAccount }}</a>&nbsp;</span>
                    <div>
                        <DateField :timestamp="createTime" showAge>&nbsp;</DateField>
                        <q-tooltip>{{createTimeFormat}}</q-tooltip>
                    </div><a class="q-ml-xs tx-link" @click="loadCreatorTransaction">
                        <q-icon name="fas fa-link"/></a>
                </div>
                <div v-else class="text-subtitle">created<span>&nbsp;</span>
                    <div>
                        <DateField :timestamp="createTime" showAge>&nbsp;</DateField>
                        <q-tooltip>{{createTimeFormat}}</q-tooltip>
                    </div>
                </div>
                <q-space/>
            </div>
            <div v-if="account !== system_account" class="resources">
                <PercentCircle
                    v-if="!accountPageSettings.hideCpuInfo"
                    :radius="radius"
                    :fraction="cpu_used"
                    :total="cpu_max"
                    label="CPU"
                    unit="s"
                />
                <PercentCircle
                    v-if="!accountPageSettings.hideNetInfo"
                    :radius="radius"
                    :fraction="net_used"
                    :total="net_max"
                    label="NET"
                    :unit="netUnit"
                />
                <PercentCircle
                    v-if="!accountPageSettings.hideRamInfo"
                    :radius="radius"
                    :fraction="ram_used"
                    :total="ram_max"
                    label="RAM"
                    :unit="ramUnit"
                />
            </div>
            <div v-else-if="!accountPageSettings.hideRamInfo" class="resources">
                <div class="usage">RAM USED: {{ ram_used }} {{ ramUnit }}</div>
            </div>
        </q-card-section>
        <q-card-section class="resources-container">
            <div class="row justify-center q-gutter-sm">
                <div v-if="isAccount" class="col-3">
                    <q-btn
                        :disable="tokensLoading || isLoading"
                        :label="tokensLoading ? 'Loading...' : 'Send'"
                        color="primary"
                        class="full-width"
                        @click="openSendDialog = true"
                    />
                </div>
                <div v-if="isAccount && !accountPageSettings.hideResourcesControl" class="col-3">
                    <q-btn
                        :disable="tokensLoading || isLoading"
                        :label='tokensLoading ? "Loading..." : "Resources"'
                        class="full-width"
                        color="primary"
                        @click="openResourcesDialog = true"
                    />
                </div>
                <div v-if="isAccount && !accountPageSettings.hideRexControl" class="col-3">
                    <q-btn
                        :disable="tokensLoading || isLoading"
                        :label='tokensLoading ? "Loading..." : "Staking (REX)"'
                        class="ellipsis full-width"
                        color="primary"
                        @click="openStakingDialog = true"
                    />
                </div>
            </div>
        </q-card-section>
        <q-markup-table>
            <thead>
                <tr>
                    <th class="text-left">BALANCE</th>
                </tr>
                <tbody class="table-body">
                    <tr></tr>
                    <tr>
                        <td class="text-left total-label">TOTAL</td>
                        <td v-if="isLoading" class="text-right total-amount total-loading-spinner">
                            <q-spinner color="white" size="1.5em"/>
                        </td>
                        <td v-else class="text-right total-amount">{{ formatAsset(totalTokens) }}</td>
                    </tr>
                    <tr class="total-row">
                        <td class="text-left"></td>
                        <td v-show="!isLoading" class="text-right total-value">{{ totalValueString }}</td>
                    </tr>
                    <tr></tr>
                    <tr>
                        <td class="text-left">LIQUID (Telos native)</td>
                        <td class="text-right">{{ formatAsset(liquidNative) }}</td>
                    </tr>
                    <tr v-if="!accountPageSettings.hideRexInfo">
                        <td class="text-left">REX staked (includes savings)</td>
                        <td class="text-right">{{ formatAsset(rexStaked) }}</td>
                    </tr>
                    <tr v-if="!accountPageSettings.hideRexInfo">
                        <td class="text-left">REX liquid deposits</td>
                        <td class="text-right">{{ formatAsset(rexDeposits) }}</td>
                    </tr>
                    <tr v-if="!accountPageSettings.hideCpuInfo">
                        <td class="text-left">STAKED for CPU</td>
                        <td class="text-right">{{ formatAsset(stakedCPU) }}</td>
                    </tr>
                    <tr v-if="!accountPageSettings.hideNetInfo">
                        <td class="text-left">STAKED for NET</td>
                        <td class="text-right">{{ formatAsset(stakedNET) }}</td>
                    </tr>
                    <tr v-if="!accountPageSettings.hideRefundingInfo">
                        <td class="text-left">REFUNDING from staking</td>
                        <td class="text-right">{{ formatAsset(stakedRefund) }}</td>
                    </tr>
                    <tr v-if="!accountPageSettings.hideDelegatedInfo">
                        <td class="text-left">DELEGATED to others</td>
                        <td class="text-right">{{ formatAsset(delegatedToOthers) }}</td>
                    </tr>
                    <tr v-if="!accountPageSettings.hideDelegatedInfo">
                        <td class="text-left">DELEGATED by others</td>
                        <td class="text-right">{{ formatAsset(delegatedByOthers) }}</td>
                    </tr>
                </tbody>
            </thead>
        </q-markup-table>
        <div v-if="isAccount">
            <SendDialog
                v-if="openSendDialog"
                v-model="openSendDialog"
                :availableTokens="availableTokens"
                @update-token-balances="updateTokenBalances"
            />
            <ResourcesDialog
                v-if="openResourcesDialog"
                v-model="openResourcesDialog"
            />
            <StakingDialog
                v-model="openStakingDialog"
                :availableTokens="availableTokens"
            />
        </div>
    </q-card>
    <q-card v-else class="account-card">
        <q-card-section class="resources-container">
            <div class="inline-section">
                <div class="row justify-center full-height items-center">
                    <div class="col-8"></div>
                    <div class="text-title text-center">Sorry, the account {{ account }} could not be found.</div>
                </div>
            </div>
        </q-card-section>
    </q-card>
</div>

</template>

<style lang="sass" scoped>
$medium:750px

.q-markup-table
  width: 100%
  th,td
    padding: unset

.account-card
  color: white
  font-size: 36px
  max-width: 100%
  background: unset

  .q-table tbody td
    font-size: 12px
    &.total-label, &.total-value
      color: white
      font-size: 14px
    &.total-amount
      font-size: 20px

  .q-table__card
    background: unset
    color: rgba(255, 255, 255, 0.8)

  .q-table--horizontal-separator
    thead th
      border-bottom: 1px solid rgba(255,255,255, 0.13)
    tbody tr:not(:last-child) td
      border-bottom: none

  .q-table thead tr, .q-table tbody td
    height: 36px

    &.total-row
      height: 48px

.resources-container
  padding: 0
  margin-bottom: 1rem

.table-body
  width: 100%
  display: table
  tr
    border-width: 0

.inline-section
  width: 100%
  display: inline-block

.resources
  text-align: center
  width: 100%
  margin: 1rem auto 0 auto

.resource
  margin-right: 2rem

.text-right
  font-weight: bold
  &.total-loading-spinner
    padding-right: .5rem

.text-title, .text-subtitle
  display: flex
  align-items: center
  justify-content: center
  width: fit-content
  margin: auto

.text-subtitle
  text-transform: uppercase
  color: rgba(255, 255, 255, 0.5)
  font-size: 12px
  a
    cursor: pointer
    text-decoration: underline

.total-amount
  color: white
  font-size: 20px
  font-weight: normal

.total-value
  font-weight: normal

.usage
  text-anchor: middle
  dominant-baseline: middle
  fill: white
  font-size: 14px

@media screen and (max-width: $medium) // screen < $medium
  .account-card
    width: 100%
    padding: unset
    margin-top: unset
    height: 100%
    border-radius: unset

  .q-markup-table
    overflow: unset
    width: unset
    margin-right: .5rem
    margin-left: .5rem

  .resources
    float: unset

  .inline-section
    width: 100%

.total-row
  a
    cursor: pointer
    text-decoration: underline
    color: white
    font-size: 16px
    font-weight: normal

.tx-link
  text-decoration: none !important
</style>
