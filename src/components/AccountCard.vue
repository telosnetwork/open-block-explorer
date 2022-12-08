<script lang="ts">
import { Token, GetTableRowsParams, RexbalRows, RexPoolRows } from 'src/types';
import { defineComponent, computed, ref, onMounted, watch } from 'vue';
import { StateInterface, useStore } from '../store';
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
import { GetterTree } from 'vuex';
import { AccountStateInterface } from 'src/store/account/state';
import { account } from 'src/store/account';

const chain = getChain();
export default defineComponent({
  name: 'AccountCard',
  components: {
    PercentCircle,
    SendDialog,
    ResourcesDialog,
    DateField,
    StakingDialog
  },
  props: {
    account: {
      type: String,
      required: true
    }
  },
  setup(props) {
    /* newly defined */
    const store = useStore();
    debugger;
    const accountData = ref<API.v1.AccountObject>();

    const liquidString = computed((): string => {
      let result = '';
      if (accountData.value?.core_liquid_balance.value) {
        result = accountData.value.core_liquid_balance.value.toFixed(4);
      }
      return result;
    });

    const totalTokens = computed(
      (): number => accountData.value?.core_liquid_balance.value || 0
    );
    const usdPrice = ref<number>();
    const totalValue = computed((): number => {
      return usdPrice.value * totalTokens.value;
    });
    const totalValueString = computed((): string => {
      let result = '';
      if (totalValue.value && usdPrice.value) {
        result = `$${totalValue.value.toFixed(2)} (@ $${usdPrice.value.toFixed(
          4
        )}/${chain.getSymbol()})`;
      }
      return result;
    });

    /**              */
    const $q = useQuasar();
    const router = useRouter();
    const createTime = ref<string>('2019-01-01T00:00:00.000');
    const MICRO_UNIT = ref(Math.pow(10, -6));
    const KILO_UNIT = ref(Math.pow(10, 3));
    const cpu_used = ref(0);
    const cpu_max = ref(0);
    const net_used = ref(0);
    const net_max = ref(0);
    const ram_used = ref(0);
    const ram_max = ref(0);
    const creatingAccount = ref('');
    // const liquid = ref<UInt64>(UInt64.from(0));
    const refunding = ref<UInt64>(UInt64.from(0));
    const staked = ref<UInt64>(UInt64.from(0));
    const none = ref<UInt64>(UInt64.from(0));
    const system_account = ref('eosio');
    // const zero = ref<UInt64>(UInt64.from(0));
    const radius = ref(44);
    const availableTokens = ref<Token[]>([]);
    const createTransaction = ref<string>('');
    const token = computed((): Token => store.state.chain.token);
    const accountExists = ref<boolean>(true);
    const openSendDialog = ref<boolean>(false);
    const openResourcesDialog = ref<boolean>(false);
    const openStakingDialog = ref<boolean>(false);
    const isAccount = computed((): boolean => {
      return store.state.account.accountName === props.account;
    });
    const resources = ref<UInt64>(UInt64.from(0));
    const delegatedResources = ref<string>('0.0000');
    const rex = ref<number>(0);
    const liqNum = ref<UInt64>(UInt64.from(0));
    debugger;
    const totalString = computed(() => {
      debugger;
      console.log(liqNum.value.toString());
      console.log(liqNum.value.toNumber());

      console.log(resources.value.toString());
      console.log(resources.value.toNumber());

      console.log(
        UInt64.add(liqNum.value as UInt64, resources.value as UInt64).toString()
      );
      console.log(
        UInt64.add(liqNum.value as UInt64, resources.value as UInt64).toNumber()
      );
      return UInt64.add(liqNum.value as UInt64, staked.value as UInt64); //TODO missing add rex.value
    });
    const createTimeFormat = computed((): string =>
      date.formatDate(createTime.value, 'DD MMMM YYYY @ hh:mm A')
    );
    const transactionId = computed(
      (): string => store.state.account.TransactionId
    );

    const setToken = (value: Token) => {
      store.commit('chain/setToken', value);
    };
    const loadAccountData = async (): Promise<void> => {
      // void updateRexBalance();
      try {
        accountData.value = await api.getAccount(props.account);
        const rexFund = await getRexFund();
        // staked.value = accountData.value.voter_info.staked.value as UInt64;
        const test = staked.value.toNumber();
        // rex.value = accountData.value.voter_info.staked.value as UInt64;
        rex.value = accountData.value.rex_info.vote_stake.value;
        debugger;
        // ? formatStaked(account.voter_info.staked.value)
        // : none.value; //+ ` ${token.value.symbol}`;
        // store.commit('account/setAccountData', data);
      } catch (e) {
        // totalTokens = refunding.value = staked.value = rex.value = none.value;
        $q.notify(`account ${props.account} not found!`);
        accountExists.value = false;
        return;
      }
      // try {
      //   const creatorData = (await api.getCreator(props.account)) as {
      //     creator: string;
      //     timestamp: string;
      //     trx_id: string;
      //   };
      //   creatingAccount.value = creatorData.creator;
      //   createTime.value = creatorData.timestamp;
      //   createTransaction.value = creatorData.trx_id;
      // } catch (e) {
      //   $q.notify(`creator account for ${props.account} not found!`);
      // }
      // availableTokens.value = data.tokens;
      // const account = data;
      // ram_used.value = fixDec(account.ram_usage.value / KILO_UNIT.value);
      // ram_max.value = fixDec(account.ram_quota.value / KILO_UNIT.value);
      // cpu_used.value = fixDec(account.cpu_limit.used.value * MICRO_UNIT.value);
      // cpu_max.value = fixDec(account.cpu_limit.max.value * MICRO_UNIT.value);
      // net_used.value = fixDec(account.net_limit.used.value / KILO_UNIT.value);
      // net_max.value = fixDec(account.net_limit.max.value / KILO_UNIT.value);
      // liquid.value = getAmount(account.core_liquid_balance.symbol.value);
      // liqNum.value = getAmount(account.core_liquid_balance.symbol.value);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      // resources.value = UInt64.add(
      //   account.self_delegated_bandwidth.cpu_weight.symbol.value,
      //   account.self_delegated_bandwidth.net_weight.symbol.value
      // );
      // const delegatedNum =
      //   Number(account.total_resources.cpu_weight.value) +
      //   Number(account.total_resources.net_weight.value) -
      //   Number(account?.self_delegated_bandwidth?.net_weight.value || 0) -
      //   Number(account?.self_delegated_bandwidth?.cpu_weight.value || 0);
      // delegatedResources.value = account?.total_resources
      //   ? (delegatedNum > 0 ? delegatedNum : 0.0).toFixed(
      //       token.value.precision
      //     ) + ` ${token.value.symbol}`
      //   : `${token.value.symbol}`;
      // debugger;
      // if (account.rex_info) {
      //   const liqNum = account.core_liquid_balance.value;
      //   const rexNum = account.rex_info.vote_stake.value;
      //   const totalString = (liqNum + rexNum).toFixed(token.value.precision);
      //   total.value = UInt64.from(totalString); //`${totalString} ${token.value.symbol}`;
      //   rex.value = account.rex_info.vote_stake.symbol.value;
      // } else {
      //   total.value = liquid.value;
      //   rex.value = none.value;
      // }
      // refunding.value = formatTotalRefund(account.refund_request);
      // staked.value = account.voter_info
      //   ? formatStaked(account.voter_info.staked.value)
      //   : none.value; //+ ` ${token.value.symbol}`;
    };
    const getRexFund = async () => {
      debugger;
      const paramsrexfund = {
        code: 'eosio',
        limit: '1',
        lower_bound: props.account as unknown as TableIndexType,
        scope: 'eosio',
        table: 'rexfund',
        reverse: false,
        upper_bound: props.account as unknown as TableIndexType
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
    const updateRexBalance = async () => {
      const paramsrexbal = {
        code: 'eosio',
        limit: '2',
        lower_bound: props.account as unknown as TableIndexType,
        scope: 'eosio',
        table: 'rexbal',
        reverse: false,
        upper_bound: props.account as unknown as TableIndexType
      } as GetTableRowsParams;
      const rexbalRows = (await api.getTableRows(paramsrexbal)) as RexbalRows;
      const paramsrexpool = {
        code: 'eosio',
        scope: 'eosio',
        table: 'rexpool',
        json: true,
        reverse: false
      } as GetTableRowsParams;
      const rexpool = ((await api.getTableRows(paramsrexpool)) as RexPoolRows)
        .rows[0];
      // const paramsrexfund = {
      //   code: 'eosio',
      //   limit: '1',
      //   lower_bound: props.account as unknown as TableIndexType,
      //   scope: 'eosio',
      //   table: 'rexfund',
      //   reverse: false,
      //   upper_bound: props.account as unknown as TableIndexType
      // } as GetTableRowsParams;
      // const rexfund = (
      //   (await api.getTableRows(paramsrexfund)) as {
      //     rows: {
      //       owner: string;
      //       balance: string;
      //     }[];
      //   }
      // ).rows[0];
      // const rexFundBalance =
      //   rexfund && rexfund.balance
      //     ? Number(rexfund.balance.split(' ')[0])
      //     : 0.0;
      const rexbal = rexbalRows.rows[0];
      const rexBalance =
        rexbal && rexbal.rex_balance
          ? parseFloat(rexbal.rex_balance.split(' ')[0])
          : 0;
      const totalRex = Number(rexpool.total_rex.split(' ')[0]);
      const totalLendable = Number(rexpool.total_lendable.split(' ')[0]);
      const tlosRexRatio = totalRex > 0 ? totalLendable / totalRex : 1;
      // let coreBalance = totalRex > 0 ? tlosRexRatio * rexBalance : 0.0;
      // coreBalance += rexFundBalance;
      if (rexbalRows.rows.length > 0) {
        // rex.value = UInt64.from(coreBalance); //.toFixed(4) + ` ${token.value.symbol}`;
      } else {
        // rex.value = UInt64.from(0);
      }
    };
    const fixDec = (val: number): number => {
      return parseFloat(val.toFixed(3));
    };
    const loadSystemToken = async (): Promise<void> => {
      if (token.value.symbol === '') {
        const tokenList = await api.getTokens(system_account.value);
        const token = tokenList.find(
          (token: Token) =>
            token.contract === `${system_account.value}.token` &&
            token.symbol === chain.getSymbol()
        );
        setToken(token);
      }
    };

    const formatStaked = (staked: UInt64): UInt64 => {
      const stakedValue = UInt64.div(
        staked,
        UInt64.from(Math.pow(10, token.value.precision))
      ); //.toFixed(token.value.precision);
      return stakedValue; //`${stakedValue} ${token.value.symbol}`;
    };

    const getAmount = (property: UInt64): UInt64 => {
      return property ? property : (none.value as UInt64);
    };

    const loadCreatorAccount = async (): Promise<void> => {
      await router.push({
        name: 'account',
        params: {
          account: creatingAccount.value
        }
      });
      router.go(0);
    };

    const loadCreatorTransaction = async (): Promise<void> => {
      await router.push({
        name: 'transaction',
        params: {
          transaction: createTransaction.value
        }
      });
      router.go(0);
    };

    // const loadPriceData = async (): Promise<void> => {
    //   const usdPrice: number = await chain.getUsdPrice();

    //   const dollarAmount = usdPrice * totalTokens.value;

    //   );
    //   totalValue.value = dollarAmount.toString(); /* `$${dollarAmount.toFixed(
    //     2
    //   )} (@ $${usdPrice}/${chain.getSymbol()})`;
    //   */
    // };

    const formatTotalRefund = (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      refund: any /*AccountRefundRequest */
    ): UInt64 => {
      const totalRefund =
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        UInt64.add(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          refund?.cpu_amount.value /* token.value.precision) + */,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          refund?.net_amount.value /* token.value.precision */
        ); //.toFixed(4);
      return totalRefund; //} ${token.value.symbol}`;
    };
    // const assetToAmount = (asset: Asset, decimals = -1): number => {
    //   try {
    //     let qty: string = asset.split(' ')[0];
    //     let val: number = parseFloat(qty);
    //     if (decimals > -1) qty = val.toFixed(decimals);
    //     return val;
    //   } catch (error) {
    //     return 0;
    //   }
    // };

    const copy = (value: string) => {
      copyToClipboard(value)
        .then((): void => {
          $q.notify({
            color: 'green-4',
            textColor: 'white',
            message: 'Copied to clipboard',
            timeout: 1000
          });
        })
        .catch(() => {
          $q.notify({
            color: 'red-8',
            textColor: 'white',
            message: 'Could not copy',
            timeout: 1000
          });
        });
    };

    onMounted(async () => {
      /***  new    */
      usdPrice.value = await chain.getUsdPrice();
      await loadAccountData();
      /***         */

      await loadSystemToken();
      // await loadPriceData();
      await store.dispatch('account/updateRexData', {
        account: props.account
      });
      void store.dispatch('chain/updateRamPrice');
    });

    watch(transactionId, async () => {
      await loadAccountData();
      await store.dispatch('account/updateRexData', {
        account: props.account
      });
    });

    watch(
      () => props.account,
      async () => {
        await loadAccountData();
        // await loadPriceData();
      }
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
      liquidString,
      totalTokens,
      totalValue,
      totalValueString,
      refunding,
      staked,
      rex,
      none,
      system_account,
      // zero,
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
      totalString,
      resources,
      accountExists,
      loadAccountData,
      setToken,
      fixDec,
      loadSystemToken,
      formatStaked,
      loadCreatorAccount,
      loadCreatorTransaction,
      // loadPriceData,
      copy
    };
  }
});
</script>

<template lang="pug">
.q-pa-md
  q-card.account-card(v-if='accountExists')
    q-card-section.resources-container
      .inline-section
        .row.justify-center.full-height.items-center
          .col-5
            .text-title {{ account }}
          .col-1
            q-btn.float-right( @click="copy(account)" flat round color="white" icon="content_copy" size='sm')
        .text-subtitle(v-if="creatingAccount !== '__self__'") created by
          span &nbsp;
            a( @click='loadCreatorAccount') {{ creatingAccount }}
          span &nbsp;
          div
            DateField( :timestamp="createTime", showAge ) &nbsp;
            q-tooltip {{createTimeFormat}}
          a(class="q-ml-xs" @click='loadCreatorTransaction').tx-link
            q-icon( name="fas fa-link")
        q-space
      .resources(v-if="account !== system_account")
        PercentCircle(:radius='radius' :fraction='cpu_used' :total='cpu_max' label='CPU' unit='s')
        PercentCircle(:radius='radius' :fraction='net_used' :total='net_max' label='NET' unit='kb')
        PercentCircle(:radius='radius' :fraction='ram_used' :total='ram_max' label='RAM' unit='kb')
    q-card-section.resources-container
      .row.justify-center.q-gutter-sm
        .col-3
          q-btn( @click="openSendDialog = true" color='primary' label='send' v-if='isAccount' class="full-width")
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
            td.text-right.total-amount {{ totalTokens.toFixed(4) }}
          tr.total-row
            td.text-left
            td.text-right.total-value {{ totalValueString }}
          tr
          tr
            td.text-left LIQUID
            td.text-right {{ liquidString }}
          tr
            td.text-left STAKED
            td.text-right {{ rex }}
          tr
            td.text-left REFUNDING
            td.text-right {{ refunding }}
          tr
            td.text-left DELEGATED BY OTHERS
            td.text-right {{ delegatedResources }}
    div(v-if='isAccount')
      SendDialog(v-model="openSendDialog" :availableTokens="availableTokens")
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
