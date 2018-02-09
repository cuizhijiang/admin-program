<template>
  <div class="tab-container">
    <el-form label-position="right"  label-width="100px">
      <el-form-item label="案例标题" >
        <el-input :disabled="true" v-model="detail.caseTitle"></el-input>
      </el-form-item>
      <el-form-item label="业务类型" >
        <el-select :disabled="true" v-model="detail.businessType" placeholder="业务类型">
          <el-option v-for="(item, index) in businessType" :label="item.tagName" :value="item.id" :key="index" ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="案例描述">
        <el-input type="textarea" :disabled="true" v-model="detail.caseDescription"></el-input>
      </el-form-item>
      <el-form-item label="案例图片">
        <img :src="detail.caseImage" alt="">
      </el-form-item>
      <el-form-item label="需求提出者" >
        <el-input :disabled="true" v-model="detail.caseProposerName"></el-input>
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
        <img :src="detail.feedbackImage" alt="">
      </el-form-item>
    </el-form>
    <el-button style="width:150px" @click="$router.push({path: '/case/index'})">返回上一页</el-button>
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
    this.getItem()
    this.getBusinessType()
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
      const res = await this.$post('/caseTable/query', params)
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
