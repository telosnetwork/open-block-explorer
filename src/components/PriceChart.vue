<template lang="pug">
div.row.col-12.justify-center(align="center")
    div.row.col-11.price-box.flex
        div.col-xs-12.col-sx-12.col-md-8.col-lg-8.col-xs-8.q-pa-md
            p price chart will be here
        div.col-xs-12.col-sx-12.col-md-4.col-lg-4.col-xs-4.q-pa-md
            div.col-12.flex.row
                div.col-6.chart-info
                    p TOKEN PRICE
                    p.sub-title $0.55
                    p.border-line
                div.col-6.chart-info
                    p MARKETCAP
                    p.sub-title $240B
                    p.border-line
            div.col-12.flex.row
                div.col-6.chart-info
                    p RANK
                    p.sub-title 52
                div.col-6.chart-info
                    p 24H VOLUME
                    p.sub-title $322M
    
</template>
<style lang="sass" scoped>
$medium:1000px
.chart-info
    @media screen and (max-width: $medium) // screen < 1000px
        text-align: center !important
    @media screen and (min-width: $medium) //screen > 1000px
        text-align: left !important
.border-line
    width: 19px
    height: 2px
    background: $primary
    border-radius: 4px
    @media screen and (max-width: $medium) // screen < 1000px
        width: 156px !important
        margin: auto
        margin-buttom: 22px
    @media screen and (min-width: $medium) //screen > 1000px
        width: 19px
.price-box
    background-color:#ffffff
    height: 260px
    // margin top is temporary
    margin-top:550px
    background: #FFFFFF
    box-shadow: 0px 9px 14px rgba(138, 101, 212, 0.1), 0px 1px 4px rgba(37, 42, 97, 0.3)
    border-radius: 10px
.title
    font-family: Actor
    font-style: normal
    font-weight: normal
    font-size: 14px
    line-height: 17px
    text-transform: uppercase
    color: #071A5F
.sub-title
    font-family: Actor
    font-style: normal
    font-weight: normal
    font-size: 22.75px
    line-height: 27px
    color: $primary
    backdrop-filter: blur(14px)
</style>
