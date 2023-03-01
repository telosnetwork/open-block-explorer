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
            <div class="col-xs-12 col-sm-10 col-md-7 col-lg-7 maxSize">
                <div class="row q-pl-sm"><img class="send-img q-pr-md" src="~assets/cpu.svg">
                    <div class="text-h4 q-pb-md inline-block color-grey-3 inline">Manage Resources</div>
                </div>
                <div class="q-pa-sm">
                    <StakingInfo/>
                    <div class="q-pt-lg">
                        <q-tabs
                            v-model="tab"
                            class="text-grey-5 tab-text text-grey"
                            dense
                            indicator-color="grey-3"
                            active-color="grey-3"
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
                        <q-separator color="grey-8"/>
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
  height: 35px
  max-width: 60px

.tab-panel
  background: inherit !important

.tab-text
  font-size: 30px !important

.q-tab-panel
  padding-left: 0 !important
  padding-right: 0 !important
</style>
