<script lang="ts">
import { AccountDetails, Token, Refund } from 'src/types';
import { defineComponent, computed, ref, onMounted } from 'vue';
import { useStore } from '../store';
import PercentCircle from 'src/components/PercentCircle.vue';
import SendDialog from 'src/components/SendDialog.vue';
import ResourcesDialog from 'src/components/Resources/ResourcesDialog.vue';
import RexDialog from 'src/components/Staking/StakingDialog.vue';
import DateField from 'src/components/DateField.vue';
import { date, useQuasar } from 'quasar';
import { copyToClipboard } from 'quasar';
import { getChain } from 'src/config/ConfigManager';
import { api } from 'src/api';
import { useRouter } from 'vue-router';

const chain = getChain();

export default defineComponent({
  name: 'AccountCard',
  components: {
    PercentCircle,
    SendDialog,
    ResourcesDialog,
    DateField,
    RexDialog
  },
  props: {
    account: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const store = useStore();
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
    const liquid = ref('');
    const total = ref('');
    const totalValue = ref('');
    const refunding = ref('');
    const staked = ref('');
    const rex = ref('');
    const none = ref('');
    const system_account = ref('eosio');
    const zero = ref(0.0);
    const radius = ref(44);
    const availableTokens = ref<Token[]>([]);
    const createTransaction = ref<string>('');
    const openSendDialog = ref<boolean>(false);
    const openStakingDialog = ref<boolean>(false);
    const openRexDialog = ref<boolean>(false);

    const isAccount = computed((): boolean => {
      return store.state.account.accountName === props.account;
    });
    const token = computed((): Token => store.state.chain.token);
    const createTimeFormat = computed((): string =>
      date.formatDate(createTime.value, 'DD MMMM YYYY @ hh:mm A')
    );

    const setToken = (value: Token) => {
      store.commit('chain/setToken', value);
    };

    const loadAccountData = async (): Promise<void> => {
      let data: AccountDetails;
      try {
        data = await api.getAccount(props.account);
        store.commit('account/setAccountData', data);
      } catch (e) {
        total.value = refunding.value = staked.value = rex.value = none.value;
        $q.notify(`account ${props.account} not found!`);
        return;
      }
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
      availableTokens.value = data.tokens;
      const account = data.account;
      ram_used.value = fixDec(account.ram_usage / KILO_UNIT.value);
      ram_max.value = fixDec(account.ram_quota / KILO_UNIT.value);
      cpu_used.value = fixDec(account.cpu_limit.used * MICRO_UNIT.value);
      cpu_max.value = fixDec(account.cpu_limit.max * MICRO_UNIT.value);
      net_used.value = fixDec(account.net_limit.used / KILO_UNIT.value);
      net_max.value = fixDec(account.net_limit.max / KILO_UNIT.value);
      liquid.value = getAmount(account.core_liquid_balance);
      if (account.rex_info) {
        const liqNum = account.core_liquid_balance.split(' ')[0];
        const rexNum = account.rex_info.vote_stake.split(' ')[0];
        const totalString = (parseFloat(liqNum) + parseFloat(rexNum)).toFixed(
          token.value.precision
        );
        total.value = `${totalString} ${token.value.symbol}`;
        rex.value = account.rex_info.vote_stake;
      } else {
        total.value = liquid.value;
        rex.value = none.value;
      }
      refunding.value = formatTotalRefund(account.refund_request);
      staked.value = account.voter_info
        ? formatStaked(account.voter_info.staked)
        : none.value;
    };

    const fixDec = (val: number): number => {
      return parseFloat(val.toFixed(3));
    };

    const loadSystemToken = async (): Promise<void> => {
      if (token.value.symbol === '') {
        const tokenList = await api.getTokens(system_account.value);
        const token = tokenList.find(
          (token: Token) => token.contract === `${system_account.value}.token`
        );
        setToken(token);
      }
    };

    const formatStaked = (staked: number): string => {
      const stakedValue = (
        staked / Math.pow(10, token.value.precision)
      ).toFixed(token.value.precision);
      return `${stakedValue} ${token.value.symbol}`;
    };

    const getAmount = (property: undefined | string): string => {
      return property ? property : `${none.value}`;
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

    const loadPriceData = async (): Promise<void> => {
      const usdPrice: number = await chain.getUsdPrice();

      const dollarAmount = usdPrice * parseFloat(total.value);
      totalValue.value = `$${dollarAmount.toFixed(
        2
      )} (@ $${usdPrice}/${chain.getSymbol()})`;
    };

    const formatTotalRefund = (refund: Refund): string => {
      const totalRefund = (
        assetToAmount(refund?.cpu_amount, token.value.precision) +
        assetToAmount(refund?.net_amount, token.value.precision)
      ).toFixed(2);
      return `${totalRefund} ${token.value.symbol}`;
    };

    const assetToAmount = (asset: string, decimals = -1): number => {
      try {
        let qty: string = asset.split(' ')[0];
        let val: number = parseFloat(qty);
        if (decimals > -1) qty = val.toFixed(decimals);
        return val;
      } catch (error) {
        return 0;
      }
    };

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
      await loadSystemToken();
      none.value = `${zero.value.toFixed(token.value.precision)} ${
        token.value.symbol
      }`;
      await loadAccountData();
      await store.dispatch('account/updateRexData', {
        account: store.state.account.accountName
      });
      await loadPriceData();
      void store.dispatch('chain/updateRamPrice');
    });

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
      liquid,
      total,
      totalValue,
      refunding,
      staked,
      rex,
      none,
      system_account,
      zero,
      radius,
      availableTokens,
      createTime,
      createTransaction,
      openSendDialog,
      openStakingDialog,
      openRexDialog,
      isAccount,
      token,
      createTimeFormat,
      loadAccountData,
      setToken,
      fixDec,
      loadSystemToken,
      formatStaked,
      loadCreatorAccount,
      loadCreatorTransaction,
      loadPriceData,
      copy
    };
  }
});
</script>

<template lang="pug">
.q-pa-md
  q-card.account-card
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
          q-btn( @click="openStakingDialog = true" color='primary' label='Resources' v-if='isAccount' class="full-width")
        .col-3
          q-btn.ellipsis( @click="openRexDialog = true" color='primary' label='staking (REX)' v-if='isAccount' class="full-width")
    q-markup-table
      thead
        tr
          th.text-left BALANCE
        tbody.table-body
          tr
          tr
            td.text-left.total-label TOTAL
            td.text-right.total-amount {{ total }}
          tr.total-row
            td.text-left
            td.text-right.total-value {{ totalValue }}
          tr
          tr
            td.text-left REFUNDING
            td.text-right {{ refunding }}
          tr
            td.text-left LIQUID
            td.text-right {{ liquid }}
          tr
            td.text-left STAKED BY OTHERS
            td.text-right {{ staked }}
          tr
            td.text-left STAKED
            td.text-right {{ rex }}
    sendDialog(v-model="openSendDialog" :availableTokens="availableTokens")
    ResourcesDialog(v-model="openStakingDialog")
    RexDialog(v-model="openRexDialog" :availableTokens="availableTokens")
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
