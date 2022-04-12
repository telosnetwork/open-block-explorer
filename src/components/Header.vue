<script lang="ts">
import { defineComponent } from 'vue';
import { isValidHex, isValidAccount } from 'src/utils/stringValidator';
import { ref } from 'vue';
import LoginHandler from 'components/LoginHandler.vue';
import { OptionsObj } from 'src/types';
export default defineComponent({
  name: 'Header',
  components: { LoginHandler },
  data() {
    return {
      tab: 'Network'
    };
  },
  setup() {
    const selected = ref<string>(null);
    const options = ref<OptionsObj[]>([]);

    return {
      selected,
      options
    };
  },
  computed: {
    isSmall(): boolean {
      return this.$q.screen.gt.sm;
    }
  },
  methods: {
    /* temp search check if possible tx or account, replace with results list rendering */
    async executeSearch(input: KeyboardEvent): Promise<void> {
      if (input != null) {
        const value = (input.currentTarget as HTMLInputElement).value;
        if (value === '') {
          this.$q.notify('no search term input');
          return;
        }
        if (isValidHex(value) && value.length == 64) {
          const check = await this.$api.getTransaction(value);
          if (check) {
            await this.$router.push({
              name: 'transaction',
              params: { transaction: value }
            });
            this.$router.go(0);
          } else {
            this.$q.notify(`transaction ${value} not found!`);
          }
        } else {
          if (isValidAccount(value)) {
            let account: string;
            try {
              account = value.toLowerCase();
              await this.$api.getAccount(account);
              await this.$router.push({
                name: 'account',
                params: {
                  account
                }
              });
              this.$router.go(0);
            } catch (e) {
              this.$q.notify(`account ${account} not found!`);
            }
          } else {
            this.$q.notify('invalid transacation id or account name');
          }
        }
      }
    },
    async suggestedSearch(): Promise<void> {
      const value = this.selected;
      if (value === '') {
        this.$q.notify('no search term input');
        return;
      }
      if (isValidHex(value) && value.length == 64) {
        const check = await this.$api.getTransaction(value);
        if (check) {
          await this.$router.push({
            name: 'transaction',
            params: { transaction: value }
          });
          this.$router.go(0);
        } else {
          this.$q.notify(`transaction ${value} not found!`);
        }
      } else {
        if (isValidAccount(value)) {
          let account: string;
          try {
            account = value.toLowerCase();
            await this.$api.getAccount(account);
            await this.$router.push({
              name: 'account',
              params: {
                account
              }
            });
            this.$router.go(0);
          } catch (e) {
            this.$q.notify(`account ${account} not found!`);
          }
        } else {
          this.$q.notify('invalid transacation id or account name');
        }
      }
    },
    async getOptions(val: string): Promise<void> {
      this.selected = val;
      if (this.selected != null) {
        var account: string;
        try {
          account = this.selected.toLowerCase();
          const value = await this.$api.getTableByScope(account);
          this.options = [];
          if (value.length > 0) {
            this.options.push({
              label: 'Accounts',
              groupLabel: true,
              group: 'account',
              disabled: true
            });
          }
          value.forEach((user) => {
            this.options.push({
              label: user.payer,
              groupLabel: false,
              group: 'account',
              disabled: false
            });
          });
        } catch (e) {
          return;
        }
      }
    }
  },
  async mounted() {
    await this.getOptions('');
  }
});
</script>

<template lang="pug">
.header-background
  .row.text-center.q-pt-sm.justify-between
    .logo-container.col-xs-2.col-sm-2.col-md-2.col-lg-2.q-pa-xs-sm.q-pa-sm-xs.q-pa-md-md.q-pa-lg-md
      a( href="/").float-left.q-ml-sm
        img.logo( v-if="isSmall" src="~assets/telos_logo.svg")
        img.logo-tlos( v-else src="~assets/tlos.png")
    .col-xs-6.col-sm-6.col-md-4.col-lg-6.q-pa-xs-sm.q-pa-sm-xs.q-pa-md-md.q-pa-lg-md.q-pt-sm
      .row.justify-center.full-width
        q-select.col-12.search-input.q-pl-md(
          borderless 
          dense 
          filled
          :model-value="selected"
          label-color="white"  
          color="primary"
          use-input
          hide-selected
          fill-input
          input-debounce="0"
          :options="options"
          @update="executeSearch"
          @keyup.enter="executeSearch" 
          :input-style="{ color: 'white' }"
          @click="executeSearch"
          @input-value="getOptions")
            template( v-slot:option="scope")
              q-item(v-if="!scope.opt.groupLabel"
                v-bind="scope.itemProps"
                v-on="scope.itemEvents"
                @click="suggestedSearch(scope.opt)"
              )             
                q-item-section
                  q-item-label(v-html="scope.opt.label")
              q-item(v-if="scope.opt.groupLabel"
                  v-bind="scope.itemProps"
                  v-on="scope.itemEvents"
                  :disable="true"
              )              
                q-item-label(header) {{ scope.opt.label }}
            template(v-slot:prepend)
              q-icon.search-icon(name="search" color="white" size="20px")
                  
    LoginHandler
  .row.justify-center.col-12.q-pt-sm
    q-tabs(v-model="tab"  active-class="active-tab" indicator-color="white" align="justify" narrow-indicator color="white")
      q-route-tab.deactive.active-tab(name="network" label="Network" to='/').temp-hide
      q-route-tab.deactive(name="wallet" label="Wallet" to="{ name: 'account', params: {account: /* store account getter */} }").temp-hide
      q-route-tab.deactive(name="vote" label="Vote" to='/vote').temp-hide
      q-route-tab.deactive(name="proposal"  label="Proposal" to='/proposal').temp-hide
      q-route-tab.deactive(name="explore" label="Explore" to='/explore').temp-hide
</template>

<style lang="sass" scoped>
$medium:750px

.q-tab
  text-transform: unset
  font-size: 18px

.logo-container
  margin-left: .5rem

.logo
    width: 104px
    height:54px
.logo-tlos
    width: 48px
    height:48px

.search-container
  margin-left: 1rem

.header-items
    list-style-type: none

.active-tab
    text-decoration: none
    color: #ffffff
    opacity: 1 !important

.deactive
    opacity: 0.3
    font-size: 18px

.header-background
    background: $primary-dark

.search-input
    background: rgba(255, 255, 255, 0.05)
    border-radius: 4px

.search-icon
    transform: rotate(90deg)

@media screen and (max-width: $medium) // screen < $medium

  .search-container
    width: 60%
    color: white
</style>
