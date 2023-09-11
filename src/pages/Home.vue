<script lang="ts">
import { defineComponent } from 'vue';
import ChainsListSelector from 'src/components/ChainsListSelector.vue';

export default defineComponent({
    name: 'HomePage',
    components: {
        ChainsListSelector,
    },
});
</script>

<template>
<div class="row home-container">
    <div class="col-12 col-sm-8 header-support home-banner">
        Welcome to Open Blok Explorer!
    </div>
    <div class="col-12 col-sm-4">
        <ChainsListSelector />
    </div>
</div>
</template>

<style lang="sass" scoped>
.home-container
    height: 100vh

.home-banner
    background-image: url("/backgrounds/home.png")
    background-repeat: no-repeat
    background-position: center
    background-size: cover
    display: flex
    align-items: center
    justify-content: center
    color: white
</style>
