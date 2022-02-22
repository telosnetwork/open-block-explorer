<template lang="pug">
div.row.footer-background.justify-center.col-12
    ul.flex.footer-items
        li.q-pa-md
            router-link.router-link(:to="{name:'terms'}")
                p TERMS
        li.q-pa-md
            router-link.router-link(:to="{name:'privacy'}")
                p PRIVACY 
        li.q-pa-md
            router-link.router-link(:to="{name:'repository'}")
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
