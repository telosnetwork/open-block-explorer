<script lang="ts">
import { useQuasar } from 'quasar';
import { computed, defineComponent, ref } from 'vue';
import { copyToClipboard } from 'quasar';
import { PublicKey, Weight } from '@greymass/eosio';

export default defineComponent({
    name: 'KeyToggle',
    props: {
        pubkey: {
            type: PublicKey,
            required: true,
        },
        weight: {
            type: Weight,
            required: true,
        },
    },
    setup(props) {
        const key = ref(props.pubkey);
        const legacyKeyFormat = ref<boolean>(false);
        const $q = useQuasar();
        const keyDisplay = computed(() =>
            legacyKeyFormat.value ? key.value.toLegacyString() : key.value.toString(),
        );
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
            keyDisplay,
            copy,
            toggleKey,
        };
    },
});
</script>

<template>

<div class="row q-pb-md">
    <div class="col wrap"><a class="hover-dec" :href=" '/key/' + keyDisplay">{{`+${weight} &nbsp; &nbsp; ${keyDisplay}`}}</a>
        <q-btn
            class="rotate-315"
            flat
            round
            color="black"
            icon="vpn_key"
            size="xs"
            @click="toggleKey()"
        >&nbsp;</q-btn>
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

</template>

<style lang="sass" scoped>
.hover-dec
  text-decoration: none
  &:hover
    text-decoration: underline
</style>
