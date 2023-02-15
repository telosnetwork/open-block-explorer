<template lang="pug">
q-drawer(
  show-if-above
  :mini="miniState"
  @mouseover="miniState = false"
  @mouseout="miniState = true"
  mini-to-overlay
  :width="175"
  :breakpoint="500"
  bordered
)
  q-scroll-area.fit
    q-list
      template( v-for="(chain, index) in getMainnets()" :key="index" )
        q-item(clickable v-ripple @click="chainSelected(chain)" :class="{ selected: isSelected(chain) }")
          q-avatar
            img( :src="chain.getSmallLogoPath()" ).sidebar-logo
          q-item-section.margin-left
            div {{ chain.getDisplay() }}
      q-separator.separator
      template( v-for="(chain, index) in getTestnets()" :key="index" )
        q-item(clickable v-ripple @click="chainSelected(chain)" :class="{ selected: isSelected(chain) }")
          q-avatar
            img( :src="chain.getSmallLogoPath()" ).sidebar-logo
          q-item-section.margin-left
            div {{ chain.getDisplay() }}
</template>

<script lang="ts">
import { ref } from 'vue';
import ConfigManager from 'src/config/ConfigManager';
import { Chain } from 'src/types/Chain';

const configMgr = ConfigManager.get();

export default {
  name: 'ChainsSidebar',
  setup() {
    return {
      miniState: ref(true),
      getAllChains: () => {
        return configMgr.getAllChains();
      },
      getMainnets: () => {
        return configMgr.getMainnets();
      },
      getTestnets: () => {
        return configMgr.getTestnets();
      },
      chainSelected(chain: Chain) {
        if (this.isSelected(chain)) {
          return;
        }
        // TODO: maybe we can reload vue store and boot files instead of full reload?
        localStorage.setItem(
          ConfigManager.CHAIN_LOCAL_STORAGE,
          chain.getName(),
        );
        location.reload();
      },
      isSelected(chain: Chain): boolean {
        return (
          localStorage.getItem(ConfigManager.CHAIN_LOCAL_STORAGE) ===
          chain.getName()
        );
      },
    };
  },
};
</script>

<style lang="sass" scoped>
.margin-left
  margin-left: .5rem
.q-item
  &:hover, &.selected
    background-color: var(--q-color-sidebar-selected)
  padding-left: 4px
  padding-top: 4px
.separator
  margin-top: .5rem
  margin-bottom: .5rem
  margin-left: 5px
  min-height: 5px
  min-width: 0
  width: calc(100% - 10px)
  background: var(--q-color-sidebar-selected)
.sidebar-logo
  height: 35px !important
  width: 35px !important
</style>
