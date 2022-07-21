<script lang="ts">
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import axios from 'axios';
import { AccountDetails, Token, Refund } from 'src/types';
import { defineComponent, computed, ref } from 'vue';
import { useStore } from '../store';
import PercentCircle from 'src/components/PercentCircle.vue';
import { exchangeStatsUrl } from 'src/components/PriceChart.vue';
import SendDialog from 'src/components/SendDialog.vue';
import StakingDialog from 'src/components/Staking/StakingDialog.vue';
import RexDialog from 'src/components/Rex/RexDialog.vue';
import DateField from 'src/components/DateField.vue';
import { mapActions } from 'vuex';
import { date } from 'quasar';
import { copyToClipboard } from 'quasar';

export default defineComponent({
  name: 'AccountCard',
  components: {
    PercentCircle,
    SendDialog,
    StakingDialog,
    DateField,
    RexDialog
  },
  props: {
    account: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      MICRO_UNIT: Math.pow(10, -6),
      KILO_UNIT: Math.pow(10, 3),
      cpu_used: 0,
      cpu_max: 0,
      net_used: 0,
      net_max: 0,
      ram_used: 0,
      ram_max: 0,
      creatingAccount: '',
      liquid: '',
      total: '',
      totalValue: '',
      refunding: '',
      staked: '',
      rex: '',
      none: '',
      system_account: 'eosio',
      zero: 0.0,
      radius: 44,
      availableTokens: <Token[]>[]
    };
  },
  setup(props) {
    const store = useStore();
    const createTime = ref<string>('2019-01-01T00:00:00.000');
    return {
      createTime: createTime,
      createTransaction: ref<string>(''),
      openSendDialog: ref<boolean>(false),
      openStakingDialog: ref<boolean>(false),
      openRexDialog: ref<boolean>(false),
      isAccount: computed((): boolean => {
        return store.state.account.accountName === props.account;
      }),
      token: computed((): Token => store.state.chain.token),
      setToken: (value: Token) => {
        store.commit('chain/setToken', value);
      },
      createTimeFormat: computed((): string =>
        date.formatDate(createTime.value, 'DD MMMM YYYY @ hh:mm A')
      )
    };
  },
  async mounted() {
    await this.loadSystemToken();
    this.none = `${this.zero.toFixed(this.token.precision)} ${
      this.token.symbol
    }`;
    await this.loadAccountData();
    await this.updateRexData({
      account: this.$store.state.account.accountName
    });
    await this.loadPriceData();
  },
  methods: {
    ...mapActions({ updateRexData: 'account/updateRexData' }),
    async loadAccountData(): Promise<void> {
      let data: AccountDetails;
      try {
        data = await this.$api.getAccount(this.account);
        this.$store.commit('account/setAccountData', data);
      } catch (e) {
        this.total = this.refunding = this.staked = this.rex = this.none;
        this.$q.notify(`account ${this.account} not found!`);
        return;
      }
      try {
        const creatorData = await this.$api.getCreator(this.account);
        this.creatingAccount = creatorData.creator;
        this.createTime = creatorData.timestamp;
        this.createTransaction = creatorData.trx_id;
      } catch (e) {
        this.$q.notify(`creator account for ${this.account} not found!`);
      }
      this.availableTokens = data.tokens;
      const account = data.account;
      this.ram_used = this.fixDec(account.ram_usage / this.KILO_UNIT);
      this.ram_max = this.fixDec(account.ram_quota / this.KILO_UNIT);
      this.cpu_used = this.fixDec(account.cpu_limit.used * this.MICRO_UNIT);
      this.cpu_max = this.fixDec(account.cpu_limit.max * this.MICRO_UNIT);
      this.net_used = this.fixDec(account.net_limit.used / this.KILO_UNIT);
      this.net_max = this.fixDec(account.net_limit.max / this.KILO_UNIT);
      this.liquid = this.getAmount(account.core_liquid_balance);
      if (account.rex_info) {
        const liqNum = account.core_liquid_balance.split(' ')[0];
        const rexNum = account.rex_info.vote_stake.split(' ')[0];
        const totalString = (parseFloat(liqNum) + parseFloat(rexNum)).toFixed(
          this.token.precision
        );
        this.total = `${totalString} ${this.token.symbol}`;
        this.rex = account.rex_info.vote_stake;
      } else {
        this.total = this.liquid;
        this.rex = this.none;
      }
      this.refunding = this.formatTotalRefund(account.refund_request);
      this.staked = account.voter_info
        ? this.formatStaked(account.voter_info.staked)
        : this.none;
    },
    async loadSystemToken(): Promise<void> {
      if (this.token.symbol === '') {
        const tokenList = await this.$api.getTokens(this.system_account);
        const token = tokenList.find(
          (token: Token) => token.contract === `${this.system_account}.token`
        );
        this.setToken(token);
      }
    },
    fixDec(val: number): number {
      return parseFloat(val.toFixed(3));
    },
    formatStaked(staked: number): string {
      const stakedValue = (staked / Math.pow(10, this.token.precision)).toFixed(
        this.token.precision
      );
      return `${stakedValue} ${this.token.symbol}`;
    },
    getAmount(property: undefined | string): string {
      return property ? property : `${this.none}`;
    },
    async loadCreatorAccount(): Promise<void> {
      await this.$router.push({
        name: 'account',
        params: {
          account: this.creatingAccount
        }
      });
      this.$router.go(0);
    },
    async loadCreatorTransaction(): Promise<void> {
      await this.$router.push({
        name: 'transaction',
        params: {
          transaction: this.createTransaction
        }
      });
      this.$router.go(0);
    },
    async loadPriceData(): Promise<void> {
      const telosPrice: number = (await axios.get(exchangeStatsUrl)).data.telos
        .usd;
      const dollarAmount = telosPrice * parseFloat(this.total);
      this.totalValue = `$${dollarAmount.toFixed(2)} (@ $${telosPrice}/TLOS)`;
    },
    formatTotalRefund(refund: Refund): string {
      const totalRefund = (
        this.assetToAmount(refund?.cpu_amount, this.token.precision) +
        this.assetToAmount(refund?.net_amount, this.token.precision)
      ).toFixed(2);
      return `${totalRefund} ${this.token.symbol}`;
    },
    assetToAmount(asset: string, decimals = -1): number {
      try {
        let qty: string = asset.split(' ')[0];
        let val: number = parseFloat(qty);
        if (decimals > -1) qty = val.toFixed(decimals);
        return val;
      } catch (error) {
        return 0;
      }
    },
    copy(value: string) {
      copyToClipboard(value)
        .then((): void => {
          this.$q.notify({
            color: 'green-4',
            textColor: 'white',
            message: 'Copied to clipboard',
            timeout: 1000
          });
        })
        .catch(() => {
          this.$q.notify({
            color: 'red-8',
            textColor: 'white',
            message: 'Could not copy',
            timeout: 1000
          });
        });
    }
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
          q-btn( @click="openStakingDialog = true" color='primary' label='staking' v-if='isAccount' class="full-width")
        .col-3
          q-btn( @click="openRexDialog = true" color='primary' label='rex' v-if='isAccount' class="full-width")
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
            td.text-left REX
            td.text-right {{ rex }}
    sendDialog(v-model="openSendDialog" :availableTokens="availableTokens")
    stakingDialog(v-model="openStakingDialog")
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
    color: $black-5

  .q-table--horizontal-separator
    thead th
      border-bottom: 1px solid $black-13
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
  color: $black-5
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
