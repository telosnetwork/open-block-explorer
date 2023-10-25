<script lang="ts">
import ConfigManager from 'src/config/ConfigManager';
import { computed } from 'vue';

export default {
    name: 'AppFooter',
    setup() {
        const footerLinks = computed(() => ConfigManager.get().getCurrentChain().getUiCustomization().footerLinks);

        return {
            footerLinks,
        };
    },
};
</script>

<template>

<div class="footer-background">
    <div class="row justify-center text-center q-py-md">
        <div v-for="footerLink in footerLinks" :key="footerLink.label" class="col-lg-1 col-md-2 col-sm-2 col-xs-4 q-pa-md">
            <a class="no-dec" :href="footerLink.url">{{footerLink.label}}</a>
        </div>
    </div>
    <div class="row justify-center text-center q-px-xl q-pb-xl">
        <span class="text-italic text-weight-thin text-caption">Cryptocurrency may be unregulated in your jurisdiction. The value of cryptocurrency may go up or down. Profits may be subject to Capital gains or other taxes as applicable to your jurisdiction.</span>
    </div>
    <img class="footer-image" src="~src/assets/footer.png">
</div>

</template>

<style lang="sass" scoped>
.router-link
    text-decoration: none
    color: #ffffff
.footer-background
    background: var(--q-color-footer-background)
    backdrop-filter: blur(14px)
    position: relative
.no-dec
    text-decoration: none
    color: white

.footer-image
    width: 100%
    max-height: 24px
    object-fit: cover
    position: absolute
    bottom: 0
</style>
