<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue';
import ChainsListSelector from 'src/components/ChainsListSelector.vue';
import ConfigManager from 'src/config/ConfigManager';
import { Chain } from 'src/types/Chain';
import { useRoute, useRouter } from 'vue-router';

const configMgr = ConfigManager.get();

export default defineComponent({
    name: 'ChainsMenu',
    components: {
        ChainsListSelector,
    },
    setup() {
        const menuOpened = ref(false);
        const route = useRoute();
        const router = useRouter();

        const menuIcon = computed(() => menuOpened.value ? 'expand_less' : 'expand_more');
        const hasChainsInstalled = computed(() => configMgr.getAllChains().length > 0);

        function chainSelected() {
            menuOpened.value = false;
        }

        function isChainSelected(chain: Chain): boolean {
            return sessionStorage.getItem(ConfigManager.CHAIN_LOCAL_STORAGE) === chain.getName();
        }

        onMounted(() => {
            const currentChain = sessionStorage.getItem(ConfigManager.CHAIN_LOCAL_STORAGE);
            if (currentChain === null) {
                const chains = configMgr.getMainnets();
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
    <q-menu v-model="menuOpened" class="chains-menu-dropdown">
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
    background: var(--q-color-dropdown-card)
    color: white
    border-radius: 12px
    overflow: hidden
    :deep(.q-item:hover), :deep(.q-item.selected)
        background-color: rgba(255, 255, 255, 0.08)
    :deep(.separator)
        background: rgba(255, 255, 255, 0.12)
    :deep(.section-title)
        color: #ACADB1
</style>

<style lang="sass">
// q-menu content is teleported outside this component's scope — style the
// wrapper globally so its default white background/corners don't peek
.chains-menu-dropdown
    background: var(--q-color-dropdown-card)
    border-radius: 12px
    overflow-y: auto
    overflow-x: hidden
</style>
