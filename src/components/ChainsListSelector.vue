<script lang="ts">
import { computed, defineComponent } from 'vue';
import { Chain } from 'src/types/Chain';
import { useRouter } from 'vue-router';
import { useNetworksStore } from 'src/stores/networks';


export default defineComponent({
    name: 'ChainsSelector',
    props: {
        onChainSelected: {
            type: Function,
            required: false,
        },
        isChainSelected: {
            type: Function,
            required: false,
            default: () => false,
        },
    },
    setup(props) {
        const router = useRouter();
        const networksStore = useNetworksStore();

        const mainnets = computed(() => sortChainsUsingName(networksStore.getMainnets));
        const testnets = computed(() => sortChainsUsingName(networksStore.getTestnets));

        function sortChainsUsingName(chains: Chain[]): Chain[] {
            return chains.sort(
                (chain1, chain2) => chain1.getName().localeCompare(chain2.getName()),
            );
        }

        function chainSelected(chain: Chain) {
            if (props.isChainSelected(chain)) {
                return;
            }
            props.onChainSelected(chain);

            void router.push({
                name: 'network',
                query: { network: String(networksStore.currentNetworkName) },
            });

        }

        return {
            mainnets,
            testnets,
            chainSelected,
        };
    },
});
</script>

<template>
<q-list>
    <div v-if="mainnets.length > 0" class="section-title">MAINNETS</div>
    <q-item
        v-for="(chain, index) in mainnets"
        :key="`mainnet-${index}`"
        v-ripple
        :class="{ selected: isChainSelected(chain) }"
        clickable
        @click="chainSelected(chain)"
    >
        <img class="sidebar-logo" :src="chain.getSmallLogoPath()">
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
        :class="{ selected: isChainSelected(chain) }"
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
</template>

<style lang="sass" scoped>
.chain-button
    padding: 0px 4px

.q-item
    &:hover, &.selected
        background-color: var(--q-color-sidebar-selected)
    padding-left: 16px
    padding-top: 8px
    width: auto

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
