<template>
  <div class="tab-container">
    <el-form label-position="right"  label-width="100px">
      <el-form-item label="需求标题" >
        <el-input :disabled="true" v-model="detail.requirementTitle"></el-input>
      </el-form-item>
      <el-form-item label="业务类型" >
        <el-select :disabled="true" v-model="detail.businessType" placeholder="业务类型">
          <el-option v-for="(item, index) in businessType" :label="item.tagName" :value="item.id" :key="index" ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="需求描述">
        <el-input v-model="detail.requirementDescription" type="textarea" :disabled="true"></el-input>
      </el-form-item>
      <el-form-item label="需求图片">
        <img :src="detail.requirementImage" alt="">
      </el-form-item>
      <el-form-item label="支撑类型" >
        <el-select :disabled="true" v-model="detail.supportType" placeholder="活动区域">
          <el-option label="衣服安康" value="1"></el-option>
          <el-option label="线下支撑" value="2"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="需求提出者" >
        <el-input v-model="detail.requirementProposerName" :disabled="true"></el-input>
      </el-form-item>
      <el-form-item label="状态" >
        <el-select :disabled="true" v-model="detail.status" placeholder="状态">
          <el-option label="未反馈" value="1"></el-option>
          <el-option label="已反馈" value="2"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="反馈信息" >
      </el-form-item>
      <el-form-item label="反馈人" >
        {{detail.feedback}}
      </el-form-item>
      <el-form-item label="反馈人手机" >
        {{detail.feedbackMobile}}
      </el-form-item>
      <el-form-item label="反馈时间" >
        {{detail.feedbackTime}}
      </el-form-item>
      <el-form-item label="反馈内容" >
        {{detail.feedbackContent}}
      </el-form-item>
      <el-form-item label="反馈图片" >
        <img v-if="detail.feedbackTime" :src="detail.feedbackTime" alt="">
      </el-form-item>
    </el-form>
    <el-button style="width:150px" @click="$router.push({ path: '/demand/index' })">返回上一页</el-button>
  </div>
</template>

<script>
export default {
  name: 'demand-dital',
  data() {
    return {
      test: '区域一',
      detail: {},
      businessType: []
    }
  },
  created() {
    this.getBusinessType()
    this.getItem()
  },
  methods: {
    async getBusinessType() { // 获取业务标签
      const params = {
        tagType: 1
      }
      const res = await this.$post('/tag/page', params)
      this.businessType = res.records
    },
    async getItem() {
      const params = {
        id: this.$route.query.id
      }
      const res = await this.$post('/requirement/query', params)
      if (res.returnCode === '1000') {
        this.detail = res.dataInfo
      }
    }
  }
}
</script>

<style scoped>
.tab-container {
  margin: 30px;
}
img{
  height: 100px;
  width: 100px;
}
</style>
