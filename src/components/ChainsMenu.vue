<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue';
import ConfigManager from 'src/config/ConfigManager';
import { Chain } from 'src/types/Chain';
import { useRoute, useRouter } from 'vue-router';

const configMgr = ConfigManager.get();

export default defineComponent({
    name: 'ChainsMenu',
    setup() {
        const menuOpened = ref(false);
        const route = useRoute();
        const router = useRouter();

        const menuIcon = computed(() => menuOpened.value ? 'expand_less' : 'expand_more');
        const mainnets = computed(() => sortChainsUsingName(configMgr.getMainnets()));
        const testnets = computed(() => sortChainsUsingName(configMgr.getTestnets()));

        function sortChainsUsingName(chains: Chain[]): Chain[] {
            return chains.sort(
                (chain1, chain2) => chain1.getName().localeCompare(chain2.getName()),
            );
        }

        function isSelected(chain: Chain): boolean {
            return sessionStorage.getItem(ConfigManager.CHAIN_LOCAL_STORAGE) === chain.getName();
        }

        function chainSelected(chain: Chain) {
            if (isSelected(chain)) {
                return;
            }

            void router.push({
                path: route.path,
                query: { network: chain.getName() },
            });

            menuOpened.value = false;
        }

        onMounted(() => {
            const currentChain = sessionStorage.getItem(ConfigManager.CHAIN_LOCAL_STORAGE);
            if (currentChain === null) {
                const chains = configMgr.getMainnets();
                const telos = chains.filter(chain => chain.getName() === 'telos')[0];
                chainSelected(telos);
            }
        });

        return {
            menuOpened,
            menuIcon,
            mainnets,
            testnets,
            chainSelected,
            isSelected,
        };
    },
});
</script>

<template>
<q-btn v-if="testnets.length > 0 || mainnets.length > 0" flat class="chain-button">
    <q-icon :name="menuIcon" size="md" />
    <q-menu v-model="menuOpened">
        <q-list>
            <div v-if="mainnets.length > 0" class="section-title">MAINNETS</div>
            <q-item
                v-for="(chain, index) in mainnets"
                :key="`mainnet-${index}`"
                v-ripple
                :class="{ selected: isSelected(chain) }"
                clickable
                @click="chainSelected(chain)"
            ><img class="sidebar-logo" :src="chain.getSmallLogoPath()">
                <q-item-section>
                    <div class="q-pl-md">{{ chain.getDisplay() }}</div>
                </q-item-section>
            </q-item>
            <q-separator v-if="testnets.length > 0 && mainnets.length > 0" class="separator"/>
            <div v-if="testnets.length > 0" class="section-title">TESTNETS</div>
            <q-item
                v-for="(chain, index) in testnets"
                :key="`testnet-${index}`"
                v-ripple
                :class="{ selected: isSelected(chain) }"
                clickable
                @click="chainSelected(chain)"
            >
                <div class="testnet-logo-container">
                    <img class="sidebar-logo sidebar-logo--testnet" :src="chain.getSmallLogoPath()">
                    <div class="testnet-text">TESTNET</div>
                </div>
                <q-item-section>
                    <div class="q-pl-md">{{ chain.getDisplay() }}</div>
                </q-item-section>
            </q-item>
        </q-list>
    </q-menu>
</q-btn>
</template>

<style lang="sass" scoped>
.chain-button
    padding: 0px 4px

.q-item
    &:hover, &.selected
        background-color: var(--q-color-sidebar-selected)
    padding-left: 16px
    padding-top: 8px
    width: 170px

.q-list
    padding-bottom: 8px
    padding-top: 8px

.separator
    margin-top: .5rem
    margin-bottom: .5rem
    min-height: 1px
    min-width: 0
    width: 100%
    background: var(--q-color-sidebar-selected)

.sidebar-logo
    height: auto
    width: auto
    max-height: 32px
    max-width: 32px
    object-fit: contain

.section-title
    padding-left: 16px
    padding-top: 8px
    padding-bottom: 8px
    font-size: 10px

.testnet-logo-container
    position: relative
    height: 32px
    width: 32px

.testnet-text, .sidebar-logo--testnet
    position: absolute
    margin: auto
    top: 0
    right: 0
    bottom: 0
    left: 0

.testnet-text
    color: white
    font-size: 6px
    width: min-content
    height: min-content
    padding: 0 2px
    border-radius: 2px
    background-color: rgba(black, 0.6)
</style>
