<template lang="pug">
div.row.footer-background.justify-center.col-12
    ul.flex.footer-items
        li.q-pa-md
            a.no-dec(href="https://telos.net/legal")
                p LEGAL
        li.q-pa-md
            a.no-dec(href="https://telos.net/privacy-policy")
                p PRIVACY 
        li.q-pa-md
            a.no-dec(href="https://github.com/telosnetwork/open-block-explorer")
                p REPOSITORY 

</template>
<style lang="sass" scoped>
div
    height:76px
.router-link
    text-decoration: none
    color: #ffffff
.footer-items
    list-style-type: none
.footer-background
    background: $primary-linier-gradient
    backdrop-filter: blur(14px)
.no-dec
    text-decoration: none
    color: white
</style>
