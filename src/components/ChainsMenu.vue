<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import ChainsListSelector from 'src/components/ChainsListSelector.vue';
import ConfigManager from 'src/config/ConfigManager';
import { Chain } from 'src/types/Chain';

const configMgr = ConfigManager.get();

export default defineComponent({
    name: 'ChainsMenu',
    components: {
        ChainsListSelector,
    },
    setup() {
        const menuOpened = ref(false);

        const menuIcon = computed(() => menuOpened.value ? 'expand_less' : 'expand_more');
        const hasChainsInstalled = computed(() => configMgr.getAllChains().length > 0);

        function chainSelected() {
            menuOpened.value = false;
        }

        function isChainSelected(chain: Chain): boolean {
            return sessionStorage.getItem(ConfigManager.CHAIN_LOCAL_STORAGE) === chain.getName();
        }

        return {
            menuOpened,
            menuIcon,
            chainSelected,
            isChainSelected,
            hasChainsInstalled,
        };
    },
});
</script>

<template>
<q-btn v-if="hasChainsInstalled" flat class="chain-button">
    <q-icon :name="menuIcon" size="md" />
    <q-menu v-model="menuOpened">
        <div class="chains-menu">
            <ChainsListSelector
                :on-chain-selected="chainSelected"
                :is-chain-selected="isChainSelected"
            />
        </div>
    </q-menu>
</q-btn>
</template>

<style lang="sass" scoped>
.chain-button
    padding: 0px 4px

.chains-menu
    width: 170px !important
</style>
