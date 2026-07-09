<script lang="ts">
import { defineComponent, ref } from 'vue';
import StakingInfo from 'src/components/resources/ResourcesInfo.vue';
import StakingTab from 'src/components/resources/StakeTab.vue';
import UnstakingTab from 'src/components/resources/UnstakeTab.vue';
import RefundTab from 'src/components/resources/RefundTab.vue';
import BuyRam from 'src/components/resources/BuyRam.vue';
import SellRam from 'src/components/resources/SellRam.vue';

export default defineComponent({
    name: 'ResourcesDialog',
    components: {
        StakingInfo,
        StakingTab,
        UnstakingTab,
        RefundTab,
        BuyRam,
        SellRam,
    },
    setup() {
        return {
            tab: ref('stake'),
        };
    },
});
</script>

<template>

<q-dialog :persistent="true" maximized>
    <q-card class="stakeCard">
        <div class="row justify-center q-pt-xl full-height full-width">
            <div class="absolute-top-right">
                <q-btn
                    v-close-popup
                    size="20px"
                    flat
                    dense
                    round
                    icon="clear"
                />
            </div>
            <div class="col-xs-12 col-sm-10 col-md-7 col-lg-7 max-dialog-width">
                <div class="row q-pl-sm"><img class="send-img q-pr-md" src="~assets/cpu.svg">
                    <div class="text-h4 q-pb-md inline-block color-grey-3 inline">Manage Resources</div>
                </div>
                <div class="q-pa-sm">
                    <StakingInfo/>
                    <div class="q-pt-lg">
                        <q-tabs
                            v-model="tab"
                            class="tab-text tab-text-muted"
                            dense
                            active-color="white"
                            narrow-indicator
                            align="left"
                            :breakpoint="0"
                            no-caps
                        >
                            <q-tab name="stake" label="Add CPU/NET"/>
                            <q-tab name="unstake" label="Remove CPU/NET"/>
                            <q-tab name="refund" label="Refund CPU/NET"/>
                            <q-tab name="buyram" label="Buy RAM"/>
                            <q-tab name="sellram" label="Sell RAM"/>
                        </q-tabs>
                        <q-separator class="dialog-separator"/>
                        <q-tab-panels v-model="tab" class="tab-panel">
                            <q-tab-panel name="stake">
                                <StakingTab/>
                            </q-tab-panel>
                            <q-tab-panel name="unstake">
                                <UnstakingTab/>
                            </q-tab-panel>
                            <q-tab-panel name="refund">
                                <RefundTab/>
                            </q-tab-panel>
                            <q-tab-panel name="buyram">
                                <BuyRam/>
                            </q-tab-panel>
                            <q-tab-panel name="sellram">
                                <SellRam/>
                            </q-tab-panel>
                        </q-tab-panels>
                    </div>
                </div>
            </div>
        </div>
    </q-card>
</q-dialog>

</template>

<style lang="sass" scoped>

.stakeCard
  color: #FFFFFF
  background: var(--q-color-secondary-gradient)
  .send-icon
    padding-bottom: 30px
  .button-accent
    background: var(--q-primary)
    border-radius: 8px
    color: #FFFFFF
  .color-grey-3
    color: #E6E9EC

.sarrowButton
  background: rgba(255, 255, 255, 0.08)

.selector-container
  cursor: pointer
  background: var(--q-color-dropdown-card)
  border-radius: 12px
  height: 40px
  margin-top: 1px
  color: #FFFFFF
  &:hover
    background: rgba(255, 255, 255, 0.08)
    border-color: rgba(255, 255, 255, 0.12)
    border-radius: 12px
  .arrowButton
    color: #FFFFFF

  .text-h6
    color: #FFFFFF
    font-weight: 600
    font-size: 1.1rem
  .subtitle
    color: #ACADB1
.send-img
  height: 35px
  max-width: 60px

.tab-panel
  background: inherit !important

.tab-text
  font-size: 30px !important
  :deep(.q-tab__indicator)
    background: var(--q-color-primary-gradient)
    height: 3px
    border-radius: 3px 3px 0 0

.tab-text-muted
  color: #ACADB1

.dialog-separator
  background: rgba(255, 255, 255, 0.12)

.q-tab-panel
  padding-left: 0 !important
  padding-right: 0 !important
</style>
