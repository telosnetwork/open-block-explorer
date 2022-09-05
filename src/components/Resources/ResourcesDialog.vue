<script lang="ts">
import { defineComponent, ref } from 'vue';
import { AccountDetails } from 'src/types';
import { mapGetters } from 'vuex';
import StakingInfo from 'src/components/Resources/StakingInfo.vue';
import StakingTab from 'src/components/Resources/StakeTab.vue';
import UnstakingTab from 'src/components/Resources/UnstakeTab.vue';
import RefundTab from 'src/components/Resources/RefundTab.vue';
import RamTab from 'src/components/Resources/RamTab.vue';

export default defineComponent({
  name: 'ResourcesDialog',
  components: {
    StakingInfo,
    StakingTab,
    UnstakingTab,
    RefundTab,
    RamTab
  },
  setup() {
    return {
      tab: ref('stake')
    };
  },
  computed: {
    ...mapGetters({ account: 'account/accountName' })
  },
  methods: {
    async loadAccountData(): Promise<void> {
      let data: AccountDetails;
      try {
        data = await this.$api.getAccount(this.account);
        this.$store.commit('account/setAccountData', data);
      } catch (e) {
        return;
      }
    }
  },
  async mounted() {
    await this.loadAccountData();
  }
});
</script>

<template lang="pug">
q-dialog( :persistent='true' maximized)
  q-card.stakeCard
    .row.justify-center.items-center.full-height.full-width
      .absolute-top-right
        q-btn(size="20px" flat dense round icon="clear" v-close-popup)
      .col-xs-12.col-sm-10.col-md-7.col-lg-7.maxSize
        .row.q-pl-sm
          img.send-img.q-pr-md( src="~assets/cpu.svg" style="height: 60px; max-width: 60px")
          .text-h4.q-pb-md.inline-block.color-grey-3.inline Manage Resources
        .q-pa-sm
          stakingInfo
          .q-pt-lg
            q-tabs.text-grey-5.tab-text(
              v-model="tab" 
              dense class="text-grey"
              indicator-color="grey-3"
              active-color="grey-3"
              narrow-indicator
              align="left"
              :breakpoint="0"
              no-caps)

              q-tab(name="stake" label="Stake CPU/NET") 
              q-tab(name="unstake" label="Unstake CPU/NET")
              q-tab(name="ram" label="Buy/Sell RAM")
              q-tab(name="refund" label="Refund")

            q-separator(color="grey-8")

            q-tab-panels(v-model="tab" class="tab-panel")
              q-tab-panel(name="stake")
                stakingTab

              q-tab-panel(name="unstake")
                unstakingTab
              
              q-tab-panel(name="ram")
                RamTab

              q-tab-panel(name="refund")
                refundTab

</template>

<style lang="sass" scoped>

.stakeCard
  color: $grey-6
  background: radial-gradient(circle at 48% 100%, rgba(108, 35, 255, 1) 0%, rgba(84, 0, 253, 1) 20%, rgba(2, 27, 100, 1) 92%)
  .send-icon
    padding-bottom: 30px
  .button-accent
    background: rgba(108, 35, 255, 1)
    border-radius: 4px
    color: $grey-4
  .color-grey-3
    color: $grey-3

.sarrowButton
  background: rgba($grey-9, 0.1)

.selector-container
  cursor: pointer
  background: rgba(108, 35, 255, 1)
  border-radius: 4px
  height: 40px
  margin-top: 1px
  color: var(--q-dark)
  &:hover
    background: rgba($grey-4, 0.3)
    border-color: $grey-1
    border-radius: 4px
  .arrowButton
    color: $grey-4

  .text-h6
    color: $grey-4
    font-weight: 600
    font-size: 1.1rem
  .subtitle
    color: $grey-4
.send-img
  height: 35px !important

.tab-panel
  background: inherit !important

.tab-text
  font-size: 30px !important

.q-tab-panel
  padding-left: 0 !important
  padding-right: 0 !important
</style>
