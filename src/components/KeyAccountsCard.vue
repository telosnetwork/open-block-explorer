<script lang="ts">
import { useQuasar } from 'quasar';
import { defineComponent, PropType, computed, ref } from 'vue';
import { copyToClipboard } from 'quasar';
import { Numeric } from 'eosjs';
import { getChain } from 'src/config/ConfigManager';

export default defineComponent({
  name: 'KeyAccountsCard',
  props: {
    pubkey: {
      type: String as PropType<string>,
      required: true
    },
    accounts: {
      type: Array as PropType<string[]>,
      required: true
    }
  },
  setup(props) {
    const chain = getChain();
    const Key = ref(props.pubkey);
    const Accounts = computed(() => props.accounts);
    const $q = useQuasar();
    console.log(chain.getSmallLogoPath());
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    const tokenLogo = computed(() => chain.getSmallLogoPath());
    function copy(value: string) {
      copyToClipboard(value)
        .then((): void => {
          $q.notify({
            color: 'green-4',
            textColor: 'white',
            message: 'Copied to clipboard',
            timeout: 1000
          });
        })
        .catch(() => {
          $q.notify({
            color: 'red-8',
            textColor: 'white',
            message: 'Could not copy',
            timeout: 1000
          });
        });
    }
    function toggleKey() {
      if (Key.value.startsWith('PUB_K1_')) {
        Key.value = Numeric.publicKeyToLegacyString(
          Numeric.stringToPublicKey(Key.value)
        );
      } else {
        Key.value = Numeric.convertLegacyPublicKey(Key.value);
      }
    }
    return {
      Key,
      Accounts,
      copy,
      toggleKey,
      tokenLogo
    };
  }
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
							.text-weight-normal.key-field {{ Key }}
								q-btn( @click="copy(Key)" flat round color="black" icon="content_copy" size='xs')
					.row.q-col-gutter-sm
						.col-12(v-for='account in Accounts')
							q-card(flat bordered)
								q-card-section
									a.hover-dec(:href='"/account/" + account') {{ account }}

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
