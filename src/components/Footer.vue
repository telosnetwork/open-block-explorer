<script lang="ts">
export default {
    name: 'AppFooter',
};
</script>

<template>

<div class="row footer-background justify-center text-center q-py-md">
    <div class="col-lg-1 col-md-2 col-sm-2 col-xs-4 q-pa-md">
        <a class="no-dec" href="https://telos.net/legal">LEGAL</a>
    </div>
    <div class="col-lg-1 col-md-2 col-sm-2 col-xs-4 q-pa-md">
        <a class="no-dec" href="https://telos.net/privacy-policy">PRIVACY</a>
    </div>
    <div class="col-lg-1 col-md-2 col-sm-2 col-xs-4 q-pa-md">
        <a class="no-dec" href="https://github.com/telosnetwork/open-block-explorer">REPOSITORY</a>
    </div>
</div>

</template>

<style lang="sass" scoped>
.router-link
    text-decoration: none
    color: #ffffff
.footer-background
    background: var(--q-color-footer-background)
    backdrop-filter: blur(14px)
.no-dec
    text-decoration: none
    color: white
</style>
