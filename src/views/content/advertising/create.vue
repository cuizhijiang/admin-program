<template>
  <advertising-detail :is-edit='false'></advertising-detail>
</template>

<script>
import advertisingDetail from './components/advertisingDetail'

export default {
  name: 'createForm',
  components: { advertisingDetail }
}
</script>