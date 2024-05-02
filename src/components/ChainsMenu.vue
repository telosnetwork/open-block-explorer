<script lang="ts">
import { computed, onMounted, defineComponent, ref } from 'vue';
import ChainsListSelector from 'src/components/ChainsListSelector.vue';
import { Chain } from 'src/types/Chain';
import { useNetworksStore } from 'src/stores/networks';
import { useRouter, useRoute } from 'vue-router';

export default defineComponent({
    name: 'ChainsMenu',
    components: {
        ChainsListSelector,
    },
    setup() {
        const menuOpened = ref(false);
        const router = useRouter();
        const route = useRoute();
        const networksStore = useNetworksStore();

        const menuIcon = computed(() => menuOpened.value ? 'expand_less' : 'expand_more');
        const hasChainsInstalled = networksStore.networks.length > 0;

        function onChainSelected(chain: Chain) {
            networksStore.currentNetworkName = chain.getName();
            menuOpened.value = false;
        }

        function isChainSelected(chain: Chain): boolean {
            return networksStore.currentNetworkName === chain.getName();
        }

        onMounted(() => {
            // FIXME: fallback should be defined by local storage or env file
            if (!networksStore.currentNetworkName || networksStore.currentNetworkName === '') {
                const chains = networksStore.getMainnets;
                const telos = chains.filter(chain => chain.getName() === 'telos')[0];

                if(!isChainSelected(telos)) {
                    void router.push({
                        path: route.path,
                        query: { network: telos.getName() },
                    });
                }
            }
        });

        return {
            menuOpened,
            menuIcon,
            onChainSelected,
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
                :on-chain-selected="onChainSelected"
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
