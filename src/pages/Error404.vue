<script lang="ts">
import { DEFAULT_THEME } from 'src/config/BaseChain';
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'Error404Page',
    setup () {
        return {
            secondary: DEFAULT_THEME.secondary,
        };
    },
});
</script>

<template>
<div class="text-primary text-center q-pa-md flex flex-center q-my-lg">
    <div class="message-404">
        <div class="text-xl">404</div>
        <div class="text-h2">Oops. Nothing here...</div>
        <q-btn
            class="q-mt-xl"
            color="white"
            :text-color="secondary"
            unelevated
            to="/"
            label="Go Home"
            no-caps
        />
    </div>
</div>
</template>

<style lang="sass">
  .message-404
    color: var(--q-secondary)
</style>
