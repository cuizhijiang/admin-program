<template>
  <card-detail :is-edit='false'></card-detail>
</template>

<script>
import cardDetail from './cardDetail'

export default {
  name: 'createForm',
  components: { cardDetail }
}
</script>