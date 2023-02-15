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
        const keyDisplay = computed(() => {
            return legacyKeyFormat.value
                ? key.value.toLegacyString()
                : key.value.toString();
        });
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

<template lang="pug">
.row.justify-center.q-py-xl
	.col-sm-12.col-md-10.col-lg-8.col-xl-6.container
		.q-pa-sm
			q-card
				q-card-section
					.row
						.col-auto.q-gutter-sm
							img.logo-token(:src="tokenLogo")
						.col-auto
						.text-h6.q-pl-sm TELOS Accounts
				q-separator(inset)
				q-card-section
					.row.q-pb-md
						.text-weight-medium Key:
						.q-pl-sm
							q-btn.rotate-315( @click="toggleKey()" flat round color="black" icon="vpn_key" size='xs') &nbsp;
						.col.wrap
							.text-weight-normal.key-field {{ keyDisplay }}
								q-btn( @click="copy(keyDisplay)" flat round color="black" icon="content_copy" size='xs')
					.row.q-col-gutter-sm
						.col-12(v-for='account in Accounts')
							q-card(flat bordered)
								q-card-section
									a.hover-dec(:href='"/account/" + account.toString()') {{ account }}

</template>

<style lang="sass" scoped>
.logo-token
	width: 28px
	height: 28px
.hover-dec
	text-decoration: none
	&:hover
		text-decoration: none
.container
	max-width: 98vw
.key-field
	word-wrap: break-word
</style>
