<script lang="ts">
import { defineComponent } from 'vue';
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
        const longText : boolean = props.text.length > 8;
        return {
            textDes :  longText ? props.text.slice(0, 8).concat('...') :props.text,
            longText,
        };
    },
});
</script>

<template>
<div>
    {{textDes}}
    <q-tooltip v-if="longText">
        {{ text}}
    </q-tooltip>
    <q-btn
        v-if="longText"
        flat
        round
        color="black"
        icon="content_copy"
        size="sm"
        @click="copy(text)"
    />
</div>

</template>

<style scoped lang="sass">

</style>
