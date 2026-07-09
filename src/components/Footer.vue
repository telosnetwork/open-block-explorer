<script lang="ts">
import ConfigManager from 'src/config/ConfigManager';
import { computed } from 'vue';

export default {
    name: 'AppFooter',
    setup() {
        const footerLinks = computed(() => ConfigManager.get().getCurrentChain().getFooterLinks());

        return {
            footerLinks,
        };
    },
};
</script>

<template>

<div class="footer-container">
    <div class="footer-gradient-bar"></div>
    <div class="row footer-background justify-center text-center q-py-md">
        <div v-for="footerLink in footerLinks" :key="footerLink.label" class="col-lg-1 col-md-2 col-sm-2 col-xs-4 q-pa-md">
            <a class="no-dec" :href="footerLink.url" target="_blank">{{footerLink.label}}</a>
        </div>
    </div>
</div>

</template>

<style lang="sass" scoped>
.router-link
    text-decoration: none
    color: #ffffff
.footer-gradient-bar
    height: 2px
    background: var(--q-color-primary-gradient)
.footer-background
    background: var(--q-color-footer-background)
    backdrop-filter: blur(14px)
.no-dec
    text-decoration: none
    color: #ACADB1
    font-size: 12px
    font-weight: 500
    letter-spacing: 0.08em
    transition: color 0.2s ease
    &:hover
        color: white
</style>
