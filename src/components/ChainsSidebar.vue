<template lang="pug">
q-drawer(
  show-if-above
  :mini="miniState"
  @mouseover="miniState = false"
  @mouseout="miniState = true"
  mini-to-overlay
  :width="200"
  :breakpoint="500"
  bordered
)
  q-scroll-area.fit
    q-list
      template( v-for="(chain, index) in getAllChains()" :key="index" )
        q-item(clickable v-ripple @click="chainSelected(chain)")
          q-item-section(avatar)
          q-avatar
            img( :src="chain.getSmallLogoPath()" )
          q-item-section
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
      chainSelected(chain: Chain) {
        if (
          localStorage.getItem(ConfigManager.CHAIN_LOCAL_STORAGE) ===
          chain.getName()
        ) {
          return;
        }

        // TODO: maybe we can reload vue store and boot files instead of full reload?
        localStorage.setItem(
          ConfigManager.CHAIN_LOCAL_STORAGE,
          chain.getName()
        );
        location.reload();
      }
    };
  }
};
</script>

<style lang="sass"></style>
