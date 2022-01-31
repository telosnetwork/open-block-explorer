<template lang="pug">
div.row.footer-background.justify-center.col-12
    ul.flex.footer-items
        li.q-pa-md
            router-link.router-link(:to="{name:'THERMS'}")
                p THERMS
        li.q-pa-md
            router-link.router-link(:to="{name:'PRIVACY'}")
                p PRIVACY 
        li.q-pa-md
            router-link.router-link(:to="{name:'REPOSITORY'}")
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
</style>
