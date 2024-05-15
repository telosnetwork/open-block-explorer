<script lang="ts">
import { defineComponent } from 'vue';
import ChainsListSelector from 'src/components/ChainsListSelector.vue';
import { Chain } from 'src/types/Chain';
import { useNetworksStore } from 'src/stores/networks';

export default defineComponent({
    name: 'HomePage',
    components: {
        ChainsListSelector,
    },
    setup() {
        const networksStore = useNetworksStore();

        function onChainSelected(chain: Chain) {
            networksStore.updatePreferredNetwork(chain.getName());
            networksStore.updateCurrentNetwork(chain.getName());
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
    justify-content: center
    color: white
    text-align: center
    > h2
        font-weight: 400

.antelope-logo
    max-height: 100px

</style>
