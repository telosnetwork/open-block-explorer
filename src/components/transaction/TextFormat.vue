<script lang="ts">
import { computed, defineComponent } from 'vue';
import { copyToClipboard } from 'quasar';

export default defineComponent({
    name: 'TextFormat',
    props: {
        text: {
            type: String,
            default: () => '',
        },
    },
    methods: {
        copy(value: string) {
            copyToClipboard(value)
                .then((): void => {
                    this.$q.notify({
                        color: 'green-4',
                        textColor: 'white',
                        message: 'Copied to clipboard',
                        timeout: 1000,
                    });
                })
                .catch(() => {
                    this.$q.notify({
                        color: 'red-8',
                        textColor: 'white',
                        message: 'Could not copy',
                        timeout: 1000,
                    });
                });
        },
    },
    setup(props) {
        const accText  = computed(() => props.text ? props.text : '');
        const longText : boolean = accText.value.length > 8;
        return {
            textDes :  longText ? accText.value.slice(0, 8).concat('...') :accText.value,
            longText,
            accText,
        };
    },
});
</script>

<template>
<div>
    {{textDes}}
    <q-tooltip v-if="longText">
        {{ accText}}
    </q-tooltip>
    <q-btn
        v-if="longText"
        flat
        round
        color="black"
        icon="content_copy"
        size="sm"
        @click="copy(accText)"
    />
</div>

</template>

<style scoped lang="sass">

</style>
