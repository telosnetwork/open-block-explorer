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
        <img class="telos-logo" src="brand-assets/telos-zero/telos-zero-light-gradient.png">
        <h2>Open Block Explorer</h2>
    </div>
    <div class="col-12 col-sm-4 chain-selector-panel">
        <ChainsListSelector :on-chain-selected="onChainSelected" />
    </div>
</div>
</template>

<style lang="sass" scoped>
.home-container
    min-height: 100vh

.home-banner
    position: relative
    min-height: 100vh
    height: auto
    background: #2C2B2F
    display: flex
    align-items: center
    flex-direction: column
    justify-content: center
    color: white
    text-align: center
    overflow: hidden
    &::after
        content: ''
        position: absolute
        right: 0
        bottom: 0
        left: 0
        height: 6px
        background: var(--q-color-primary-gradient)
    > h2
        position: relative
        margin-top: 28px
        font-size: 34px
        font-weight: 400
        letter-spacing: 0

.telos-logo
    position: relative
    width: min(320px, 78vw)
    max-height: 106px
    object-fit: contain

.chain-selector-panel
    background: #FFFFFF
    border-left: 1px solid #E6E9EC
    color: #2C2B2F
    display: flex
    align-items: center
    justify-content: center
    .q-list
        width: 100%

@media screen and (max-width: 599px)
    .home-banner
        min-height: 44vh
    .chain-selector-panel
        min-height: 56vh
        border-left: 0
        border-top: 1px solid #E6E9EC

</style>
