<script lang="ts">
import { defineComponent } from 'vue';
import ChainsListSelector from 'src/components/ChainsListSelector.vue';
import ConfigManager from 'src/config/ConfigManager';
import { Chain } from 'src/types/Chain';

export default defineComponent({
    name: 'HomePage',
    components: {
        ChainsListSelector,
    },
    setup() {
        function onChainSelected(chain: Chain) {
            ConfigManager.get().setPreferredChain(chain);
        }

        return {
            onChainSelected,
        };
    },
});
</script>

<template>
<div class="row home-container">
    <div class="col-12 col-sm-8 header-support home-banner">
        Welcome to Open Block Explorer!
    </div>
    <div class="col-12 col-sm-4">
        <ChainsListSelector :on-chain-selected="onChainSelected" />
    </div>
</div>
</template>

<style lang="sass" scoped>
.home-container
    height: 100vh

.home-banner
    background-image: url("/backgrounds/home.png")
    background-repeat: no-repeat
    background-position: center
    background-size: cover
    display: flex
    align-items: center
    justify-content: center
    color: white
</style>
