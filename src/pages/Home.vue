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
    <div class="col-12 col-sm-8 q-pa-md header-support home-banner">
        <img class="antelope-logo" src="icons/antelope-logo.png">
        <h2>Open Block Explorer</h2>
        <div class="chain-container">
            <img class="chain-logo" src="chains/telos/telos_logo.svg">
            <img class="chain-logo" src="chains/eos/eos.png">
            <img class="chain-logo" src="chains/wax/logo_lg.png">
            <img class="chain-logo" src="chains/ux/logo_sm.png">
        </div>
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
    flex-direction: column
    justify-content: space-around
    color: white
    text-align: center
    > h2
        font-weight: 400

.antelope-logo
    max-height: 100px

.chain-container
    display: flex
    gap: 20px
    align-items: center
    flex-wrap: wrap
    justify-content: center

.chain-logo
    max-height: 50px
    max-width: 100px

</style>
