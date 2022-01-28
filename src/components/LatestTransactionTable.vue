<template lang="pug">
div.row.col-12.q-mt-xs.justify-center.text-left
    div.row.col-11
        div.row.col-12.q-mt-lg
            div.col-3
                p.table-title Latest Transactions
            q-space
            div.col-3.row.flex
                q-btn.q-ml-xs.q-mr-xs.col.button-primary Actions
                q-btn.q-ml-xs.q-mr-xs.col.button-primary Date
                q-btn.q-ml-xs.q-mr-xs.col.button-primary Token
        q-separator.row.col-12.q-mt-md.separator
        q-table.q-mt-lg.col-12.row(:rows="rows"
            :columns="columns"
            row-key="name"
            :flat="true"
            :bordered="true"
            :square="true"
            table-header-class="table-header")
</template>
<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'LatestTransactionTable',
  data() {
    return {
      columns: [
        {
          name: 'TRANSACTION',
          required: true,
          label: 'TRANSACTION',
          align: 'left',
          sortable: true
        },
        {
          name: 'TIMESTAMP',
          required: true,
          align: 'left',
          label: 'TIMESTAMP',
          field: 'calories',
          sortable: true
        },
        {
          name: 'ACTION',
          required: true,
          align: 'left',
          label: 'ACTION',
          field: 'fat',
          sortable: true
        },
        {
          name: 'DATA',
          required: true,
          align: 'left',
          label: 'DATA',
          field: 'carbs'
        }
      ],
      rows: [
        {
          name: 'Frozen Yogurt',
          calories: 159,
          fat: 6.0,
          carbs: 24,
          protein: 4.0,
          sodium: 87,
          calcium: '14%',
          iron: '1%'
        },
        {
          name: 'Ice cream sandwich',
          calories: 237,
          fat: 9.0,
          carbs: 37,
          protein: 4.3,
          sodium: 129,
          calcium: '8%',
          iron: '1%'
        }
      ]
    };
  }
});
</script>
<style lang="sass" scoped>
body
    height:1000px
.table-header
    color: #000000 !important
    opacity: 0.5
.table-title
    font-family: Actor
    font-style: normal
    font-weight: normal
    font-size: 22.75px
    line-height: 27px
.separator
    min-width: 100%
    min-height: 2px
    background: rgba(138, 101, 212, 0.3)
    border-radius: 4px
</style>
