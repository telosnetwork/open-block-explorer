<script lang="ts">
import { useQuasar } from 'quasar';
import { defineComponent, PropType, computed, ref } from 'vue';
import { copyToClipboard } from 'quasar';
import { getChain } from 'src/config/ConfigManager';
import { Name, PublicKey } from '@greymass/eosio';

export default defineComponent({
    name: 'KeyAccountsCard',
    props: {
        pubKey: {
            type: PublicKey,
            required: true,
        },
        accounts: {
            type: Array as PropType<Name[]>,
            required: true,
        },
    },
    setup(props) {
        const chain = getChain();
        const key = ref(props.pubKey);
        const legacyKeyFormat = ref<boolean>(false);
        const Accounts = computed(() => props.accounts);
        const $q = useQuasar();
        const keyDisplay = computed(() => legacyKeyFormat.value
            ? key.value.toLegacyString()
            : key.value.toString());
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        const tokenLogo = computed(() => chain.getSmallLogoPath());
        function copy(value: string) {
            copyToClipboard(value)
                .then((): void => {
                    $q.notify({
                        color: 'green-4',
                        textColor: 'white',
                        message: 'Copied to clipboard',
                        timeout: 1000,
                    });
                })
                .catch(() => {
                    $q.notify({
                        color: 'red-8',
                        textColor: 'white',
                        message: 'Could not copy',
                        timeout: 1000,
                    });
                });
        }
        function toggleKey() {
            legacyKeyFormat.value = !legacyKeyFormat.value;
        }
        return {
            key,
            Accounts,
            keyDisplay,
            copy,
            toggleKey,
            tokenLogo,
        };
    },
});
</script>

<template>

<div class="row justify-center q-py-xl">
    <div class="col-sm-12 col-md-10 col-lg-8 col-xl-6 container-max-width">
        <div class="q-pa-sm">
            <q-card>
                <q-card-section>
                    <div class="row">
                        <div class="col-auto q-gutter-sm"><img class="logo-token" :src="tokenLogo"></div>
                        <div class="col-auto"></div>
                        <div class="text-h6 q-pl-sm">Accounts</div>
                    </div>
                </q-card-section>
                <q-separator inset="inset"/>
                <q-card-section>
                    <div class="row q-pb-md">
                        <div class="text-weight-medium">Key</div>
                        <div class="q-pl-sm">
                            <q-btn
                                class="rotate-315"
                                flat
                                round
                                color="black"
                                icon="vpn_key"
                                size="xs"
                                @click="toggleKey()"
                            >&nbsp;</q-btn>
                        </div>
                        <div class="col wrap">
                            <div class="text-weight-normal key-field">{{ keyDisplay }}
                                <q-btn
                                    flat
                                    round
                                    color="black"
                                    icon="content_copy"
                                    size="xs"
                                    @click="copy(keyDisplay)"
                                />
                            </div>
                        </div>
                    </div>
                    <div class="row q-col-gutter-sm">
                        <div
                            v-for="account in Accounts"
                            :key="account.toString()"
                            class="col-12"
                        >
                            <q-card flat bordered>
                                <q-card-section><a class="hover-dec" :href='"/account/" + account.toString()'>{{ account }}</a></q-card-section>
                            </q-card>
                        </div>
                    </div>
                </q-card-section>
            </q-card>
        </div>
    </div>
</div>

</template>

<style lang="sass" scoped>
.logo-token
	width: 28px
	height: 28px
.hover-dec
	text-decoration: none
	&:hover
		text-decoration: none
.key-field
	word-wrap: break-word
</style>
