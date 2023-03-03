<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'Error404Page',
});
</script>

<template>
<div class="fullscreen bg-blue text-white text-center q-pa-md flex flex-center">
    <div>
        <div class="text-xl">404</div>
        <div class="text-h2">Oops. Nothing here...</div>
        <q-btn
            class="q-mt-xl"
            color="white"
            text-color="blue"
            unelevated
            to="/"
            label="Go Home"
            no-caps
        />
    </div>
</div>
</template>
