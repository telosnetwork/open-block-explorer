<script lang="ts">
import { Token, GetTableRowsParams, RexbalRows, RexPoolRows } from 'src/types';
import { defineComponent, computed, ref, onMounted, watch } from 'vue';
import { useStore } from 'src/store';
import PercentCircle from 'src/components/PercentCircle.vue';
import SendDialog from 'src/components/SendDialog.vue';
import ResourcesDialog from 'src/components/Resources/ResourcesDialog.vue';
import StakingDialog from 'src/components/Staking/StakingDialog.vue';
import DateField from 'src/components/DateField.vue';
import { date, useQuasar } from 'quasar';
import { copyToClipboard } from 'quasar';
import { getChain } from 'src/config/ConfigManager';
import { api } from 'src/api';
import { useRouter } from 'vue-router';
import { TableIndexType } from 'src/types/Api';
import { API, UInt64 } from '@greymass/eosio';

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
        const store = useStore();

        const createTime = ref<string>('2019-01-01T00:00:00.000');
        const createTransaction = ref<string>('');
        const creatingAccount = ref('');
        const system_account = ref('eosio');

        const isLoading = ref<boolean>(true);
        const tokensLoading = ref<boolean>(true);
        const none = ref<UInt64>(UInt64.from(0));
        const MICRO_UNIT = ref<number>(Math.pow(10, -6));
        const KILO_UNIT = ref<number>(Math.pow(10, 3));
        const resources = ref<number>(0);
        const delegatedResources = ref<number>(0.0);
        const rex = ref<number>(0);
        const usdPrice = ref<number>();
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

        const totalRefund = computed((): number =>
            accountData.value && accountData.value.refund_request
                ? accountData.value.refund_request?.cpu_amount.value +
          accountData.value.refund_request?.net_amount.value
                : 0,
        );

        const token = computed((): Token => store.state.chain.token);

        const liquid = computed((): number => accountData.value?.core_liquid_balance?.value
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
            if (totalValue.value && usdPrice.value) {
                result = `$${totalValue.value.toFixed(2)} (@ $${usdPrice.value.toFixed(
                    4,
                )}/${chain.getSystemToken().symbol})`;
            }
            return result;
        });

        const isAccount = computed((): boolean => store.state.account.accountName === props.account);

        const createTimeFormat = computed((): string =>
            date.formatDate(createTime.value, 'DD MMMM YYYY @ hh:mm A'),
        );

        const setToken = (value: Token) => {
            store.commit('chain/setToken', value);
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
            } catch (e) {
                $q.notify(`account ${props.account} not found!`);
                accountExists.value = false;
                return;
            }
        };

        const loadBalances = async () => {
            const rexBalance = await getRexBalance();
            const rexFund = await getRexFund();
            rex.value = rexBalance + rexFund;
        };

        const loadResources = () => {
            ram_used.value = fixDec(
                Number(accountData.value.ram_usage) / KILO_UNIT.value,
            );

            if (props.account !== system_account.value) {
                ram_max.value = fixDec(
                    Number(accountData.value.ram_quota) / KILO_UNIT.value,
                );
                cpu_used.value = fixDec(
                    Number(accountData.value.cpu_limit.used) * MICRO_UNIT.value,
                );
                cpu_max.value = fixDec(
                    Number(accountData.value.cpu_limit.max) * MICRO_UNIT.value,
                );
                net_used.value = fixDec(
                    Number(accountData.value.net_limit.used) / KILO_UNIT.value,
                );
                net_max.value = fixDec(
                    Number(accountData.value.net_limit.max) / KILO_UNIT.value,
                );

                stakedResources.value =
          Number(accountData.value.total_resources.cpu_weight.value) +
          Number(accountData.value.total_resources.net_weight.value);

                delegatedResources.value = Math.abs(
                    stakedResources.value -
            Number(
                accountData.value.self_delegated_bandwidth?.net_weight.value || 0,
            ) -
            Number(
                accountData.value.self_delegated_bandwidth?.cpu_weight.value || 0,
            ),
                );
            }
        };

        const setTotalBalance = () => {
            totalTokens.value =
        liquid.value +
        rex.value +
        totalRefund.value +
        (stakedResources.value - delegatedResources.value);
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
            const rexBalance =
        rexBal && rexBal.rex_balance
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
            return totalRex > 0 ? tlosRexRatio * rexBalance : 0.0;
        };

        const fixDec = (val: number): number => parseFloat(val.toFixed(3));

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

        const formatAsset = (val: number | string): string => typeof val === 'string'
            ? val
            : `${val.toFixed(4)} ${chain.getSystemToken().symbol}`;

        const resetBalances = () => {
            totalTokens.value = '--';
            rex.value = stakedResources.value = delegatedResources.value = 0;
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

        return {
            MICRO_UNIT,
            KILO_UNIT,
            cpu_used,
            cpu_max,
            net_used,
            net_max,
            ram_used,
            ram_max,
            creatingAccount,
            isLoading,
            tokensLoading,
            liquid,
            totalRefund,
            totalTokens,
            totalValue,
            totalValueString,
            rex,
            none,
            system_account,
            radius,
            availableTokens,
            createTime,
            createTransaction,
            openSendDialog,
            openResourcesDialog,
            openStakingDialog,
            delegatedResources,
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

<template lang="pug">
.q-pa-md
  q-card.account-card(v-if='accountExists')
    q-card-section.resources-container
      .inline-section
        .row.justify-center.full-height.items-center
          .col-5(v-if="account !== system_account")
            .text-title {{ account }}
          .col-2(v-else)
            .text-title {{ account }}
          .col-1
            q-btn.float-right( @click="copy(account)" flat round color="white" icon="content_copy" size='sm')
        .text-subtitle(v-if="creatingAccount && creatingAccount !== '__self__'") created by
          span &nbsp;
            a( @click='loadCreatorAccount') {{ creatingAccount }}
          span &nbsp;
          div
            DateField( :timestamp="createTime", showAge ) &nbsp;
            q-tooltip {{createTimeFormat}}
          a(class="q-ml-xs" @click='loadCreatorTransaction').tx-link
            q-icon( name="fas fa-link")
        .text-subtitle(v-else) created
          span &nbsp;
          div
            DateField( :timestamp="createTime", showAge ) &nbsp;
            q-tooltip {{createTimeFormat}}
        q-space
      .resources(v-if="account !== system_account")
        PercentCircle(:radius='radius' :fraction='cpu_used' :total='cpu_max' label='CPU' unit='s')
        PercentCircle(:radius='radius' :fraction='net_used' :total='net_max' label='NET' unit='kb')
        PercentCircle(:radius='radius' :fraction='ram_used' :total='ram_max' label='RAM' unit='kb')
      .resources(v-else)
        div.usage RAM USED: {{ ram_used }} kb
    q-card-section.resources-container
      .row.justify-center.q-gutter-sm
        .col-3
          q-btn(
            v-if='isAccount'
            :disabled="tokensLoading || isLoading"
            :label='tokensLoading ? "Loading..." : "Send"'
            color='primary'
            class="full-width"
            @click="openSendDialog = true"
          )
        .col-3
          q-btn( @click="openResourcesDialog = true" color='primary' label='Resources' v-if='isAccount' class="full-width")
        .col-3
          q-btn.ellipsis( @click="openStakingDialog = true" color='primary' label='staking (REX)' v-if='isAccount' class="full-width")
    q-markup-table
      thead
        tr
          th.text-left BALANCE
        tbody.table-body
          tr
          tr
            td.text-left.total-label TOTAL
            td.text-right.total-amount.total-loading-spinner(v-if='isLoading')
               q-spinner(color="white" size="1.5em")
            td.text-right.total-amount(v-else) {{ formatAsset(totalTokens) }}
          tr.total-row
            td.text-left
            td.text-right.total-value(v-show='!isLoading') {{ totalValueString }}
          tr
          tr
            td.text-left LIQUID
            td.text-right {{ formatAsset(liquid) }}
          tr
            td.text-left STAKED
            td.text-right {{ formatAsset(rex) }}
          tr
            td.text-left REFUNDING
            td.text-right {{ formatAsset(totalRefund) }}
          tr
            td.text-left DELEGATED BY OTHERS
            td.text-right {{ formatAsset(delegatedResources) }}
    div(v-if='isAccount')
      SendDialog(v-model="openSendDialog" @update-token-balances='updateTokenBalances' :availableTokens="availableTokens")
      ResourcesDialog(v-model="openResourcesDialog")
      StakingDialog(v-model="openStakingDialog" :availableTokens="availableTokens")

  q-card.account-card(v-else)
    q-card-section.resources-container
      .inline-section
        .row.justify-center.full-height.items-center
          .col-8
          .text-title.text-center Sorry, the account {{ account }} could not be found.
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
    color: rgba(255, 255, 255, 0.5)

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
  width:100%
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
