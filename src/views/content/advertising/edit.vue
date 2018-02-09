<template>
  <advertising-detail :is-edit='true'></advertising-detail>
</template>

<script>
import advertisingDetail from './components/advertisingDetail'

export default {
  name: 'createForm',
  components: { advertisingDetail }
}
</script>