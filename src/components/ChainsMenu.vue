<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import ChainsListSelector from 'src/components/ChainsListSelector.vue';
import ConfigManager from 'src/config/ConfigManager';

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

        return {
            menuOpened,
            menuIcon,
            chainSelected,
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
            <ChainsListSelector :on-chain-selected="chainSelected"/>
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
