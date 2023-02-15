<script lang="ts">
export default {
    name: 'AppFooter',
};
</script>

<template lang="pug">
    .row.footer-background.justify-center.text-center.q-py-md
        .col-lg-1.col-md-2.col-sm-2.col-xs-4.q-pa-md
            a.no-dec(href="https://telos.net/legal") LEGAL
        .col-lg-1.col-md-2.col-sm-2.col-xs-4.q-pa-md
            a.no-dec(href="https://telos.net/privacy-policy") PRIVACY
        .col-lg-1.col-md-2.col-sm-2.col-xs-4.q-pa-md
            a.no-dec(href="https://github.com/telosnetwork/open-block-explorer") REPOSITORY

</template>

<style lang="sass" scoped>
.router-link
    text-decoration: none
    color: #ffffff
.footer-background
    background: var(--q-primary-linear-gradient)
    backdrop-filter: blur(14px)
.no-dec
    text-decoration: none
    color: white
</style>
