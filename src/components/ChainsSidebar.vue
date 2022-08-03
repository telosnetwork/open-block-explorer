<template lang="pug">
q-drawer(
  show-if-above
  :width="200"
  :breakpoint="500"
  side="left"
  bordered
  class="bg-grey-3"
)
  q-scroll-area.fit
    q-list
      template( v-for="(chain, index) in getAllChains()" :key="index" )
        q-item(clickable @click="chainSelected(chain)")
          q-item-section
            q-icon( :name="`menu`" )
          q-item-section
            div {{ chain.getDisplay() }}
</template>

<script lang="ts">
import ConfigManager from 'src/config/ConfigManager';
import { Chain } from 'src/types/Chain';

const configMgr = ConfigManager.get();

export default {
  name: 'ChainsSidebar',
  methods: {
    getAllChains() {
      return configMgr.getAllChains();
    },
    chainSelected(chain: Chain) {
      // TODO: maybe we can reload vue store and boot files instead of full reload?
      localStorage.setItem(ConfigManager.CHAIN_LOCAL_STORAGE, chain.getName());
      location.reload();
    }
  }
};
</script>

<style scoped></style>
