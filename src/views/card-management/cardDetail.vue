<template>
  <div class="tab-container">
    <!-- <el-tag>mounted times ：{{createdTimes}}</el-tag> -->
    <el-tabs style='margin-top:15px;' v-model="activeName" type="border-card">
      <el-tab-pane label="基本信息" name="first" >
        <el-form  label-position="left" :model="newdata" label-width="100px">
          <el-form-item label="标题"  >
            <el-input v-model="newdata.title" placeholder="请输入标题" ></el-input>
          </el-form-item>
          <el-form-item label="正文" >
              <tinymce :height='500'  ref="editor" v-model="newdata.content" ></tinymce>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="关联信息" name="second">
        <el-form :inline="true" label-width="100px" label="left"  label-position="left" >
           <el-form-item class="width" label="作者"  >
                <el-input placeholder="作者" v-model="newdata.author"></el-input>
            </el-form-item>
           <el-form-item class="width imgform" label="图片" >
             <div class="imgWrap" v-if="newdata.image !== null">
               <i @click="removeImg"  v-if="newdata.image" class="el-icon-circle-close"></i>
               <div>

               </div>
               <img class="imgs" :src="newdata.image" alt="">
             </div>
             <div class="upload_img" v-else>
               <input class="file" type="file" accept="image/*" @change="uploadImg" >
               <div class="el-icon-plus el-upload avatar-uploader-icon">
              </div>
             </div>
            </el-form-item>
          <el-form-item class="width" label="业务标签">
            <el-select v-model="newdata.businessTag" placeholder="活动区域">
              <el-option label="请选择业务类型" :value="null" ></el-option>
              <el-option v-for="(item, index) in businessType" :label="item.tagName" :value="item.id" :key="index" ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item class="width" label="自定义标签">
            <el-select v-model="newdata.customTag" placeholder="活动区域">
              <el-option label="请选择自定义标签" :value="null" ></el-option>
              <el-option v-for="(item, index) in customTag" :label="item.tagName" :value="item.id" :key="index" ></el-option>
            </el-select>
          </el-form-item>
        <el-form-item class="width" label="是否热门">
       <el-switch
            v-model="newdata.hot"
            active-color="#409EFF"
            inactive-color="#dcdfe6" active-value="1" inactive-value="2"></el-switch>
        </el-form-item>
        <el-form-item class="width" label="引用类型">
          <el-checkbox-group v-model="newdata.referenceType">
            <el-checkbox label="人人专刊"></el-checkbox>
            <el-checkbox label="产品资讯"></el-checkbox>
          </el-checkbox-group>
        </el-form-item>
       <el-form-item class="width" label="是否置顶">
        <el-switch
            v-model="newdata.top"
            active-color="#409EFF"
            inactive-color="#dcdfe6" active-value="1" inactive-value="2"></el-switch>
        </el-form-item>
       <el-form-item class="width"  label="是否生效">
          <el-switch
            v-model="newdata.status"
            active-color="#409EFF"
            inactive-color="#dcdfe6" active-value="1" inactive-value="2"></el-switch>
        </el-form-item>
        </el-form>
      </el-tab-pane>
      <div style="margin-top:50px;">
        <el-button type="primary" @click="saveCase()">保存</el-button>
        <el-button @click="$router.push({path:'/cardmanagement/card'})">返回上一页</el-button>
      </div>
    </el-tabs>
  </div>
</template>

<script>
// 不可编辑状态 window.tinymce.activeEditor.getBody().setAttribute('contenteditable',false);
import MDinput from '@/components/MDinput'
import Tinymce from '@/components/Tinymce'
import axios from 'axios'
import { photoCompress, canvasDataURL, base64UrlToBlob } from '../../utils/agImg'

const defaultForm = {
  id: null,
  title: '', // 标题
  author: '', // 作者
  businessTag: null, // 业务标签
  customTag: null, // 自定义标签
  hot: '1', // 是否热门
  referenceType: [], // 引用类型
  top: '1', // 是否置顶
  status: '1', // 状态
  image: null, // 图片
  commentAmount: null, // 帖子的评论数量
  checkAmount: null, // 帖子的查看数量
  createdTime: null, // 帖子创建时间
  createdBy: 666, // 创建人
  updatedTime: null, // 更新时间
  updatedBy: null // 更新人登入返回
}

export default {
  name: 'new-card',
  components: {
    MDinput,
    Tinymce
  },
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      businessType: [], // 业务标签
      customTag: [], // 自定义标签
      newdata: Object.assign({}, defaultForm),
      activeName: 'first' // 默认展示第一个
    }
  },
  created() {
    if (this.isEdit) {
      this.newdata.id = this.$route.query.id
      this.fetchData()
    }
    this.getBusinessType()
    this.getCustomTag()
  },
  mounted() {
  },
  methods: {
    showCreatedTimes() {
      this.createdTimes = this.createdTimes + 1
    },
    async fetchData() {
      const params = {
        id: this.$route.query.id
      }
      const res = await this.$post('/post/query', params)
      if (res.returnCode === '1000') {
        this.newdata = res.dataInfo
        this.newdata.referenceType = JSON.parse(this.newdata.referenceType)
      }
    },
    async saveCase() { // 保存帖子
      console.log(this.$refs.editor)
      if (this.newdata.title.trim().length <= 0) {
        return this.warning('请输入标题')
      } else if (this.newdata.title.trim().length > 30) {
        return this.warning('标题不能超过30个字')
      }
      if (this.newdata.content.trim() <= 0) {
        return this.warning('内容不能为空')
      }
      if (this.newdata.author.trim().length <= 0) {
        return this.warning('请输入作者')
      } else if (this.newdata.author.trim().length > 20) {
        return this.warning('作者不能超过20个字')
      }
      if (!this.newdata.businessTag) {
        return this.warning('请选择业务标签')
      }
      if (!this.newdata.customTag) {
        return this.warning('请选择自定义标签')
      }
      if (this.newdata.referenceType.length <= 0) {
        return this.warning('请求选择引用类型')
      }
      if (!this.newdata.image) {
        return this.warning('请选择添加图片')
      }
      const params = {
        id: this.newdata.id,
        title: this.newdata.title,
        content: this.newdata.content,
        author: this.newdata.author,
        businessTag: this.newdata.businessTag,
        customTag: this.newdata.customTag,
        hot: this.newdata.hot,
        referenceType: JSON.stringify(this.newdata.referenceType),
        top: this.newdata.top,
        status: this.newdata.status,
        image: this.newdata.image,
        createdBy: this.newdata.createdBy
      }
      let postUrl = '/post/add'
      if (this.isEdit) {
        postUrl = '/post/update'
      }
      const res = await this.$post(postUrl, params)
      if (res.returnCode === '1000') {
        this.warning('成功', 'success')
        if (!this.isEdit) {
          this.resetData()
        }
      }
    },
    async getBusinessType() { // 获取业务标签
      const params = {
        tagType: 1
      }
      const res = await this.$post('/tag/page', params)
      this.businessType = res.records
    },
    async getCustomTag() { // 获取自定义标签
      const params = {
        tagType: 2
      }
      const res = await this.$post('/tag/page', params)
      this.customTag = res.records
    },
    async uploadImg(e) {
      if (this.newdata.image) {
        return this.warning('只能上传一张图片')
      }
      const res = await photoCompress(e.target.files[0])
      canvasDataURL(res, (data) => {
        this.newdata.image = data
        var param = new FormData()
        const blob = base64UrlToBlob(data) // 讲base转化为blob对象
        var config = {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
        param.append('fileData', blob, 'file_' + Date.parse(new Date()) + '.jpg')
        axios.post(`${this.$APPROOT}/moses/upload/file/upload`, param, config).then(res => {
          if (res.returnCode === '1000') {
            this.newdata.image = res.dataInfo.url
          }
        })
      })
    },
    resetData() {
      Object.assign({}, defaultForm)
      this.activeName = 'first'
    },
    removeImg() {
      this.newdata.image = null
    },
    warning(tips, type) {
      this.$message({
        showClose: true,
        message: tips,
        type: type || 'warning'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .tab-container{
    margin: 30px;
  }
  .width{
    width: 100%;
  }
  .imgWrap{
    height: 180px;
    width: 180px;
    position: relative;
    float: left;
    .imgs{
      position: absolute;
      left: 0;
      height: 180px;
      width: 180px;
      z-index: 11;
    }
    &:hover .el-icon-circle-close{
      opacity: 1;
    }
    .el-icon-circle-close{
      opacity: 0;
      position: absolute;
      left: 0;
      height: 180px;
      width: 180px;
      z-index: 20;
      font-size: 30px;
      background-color: rgba(0,0,0,.5);
      text-align: center;
      line-height: 180px;
      transform: opacity 0.3s;
    }
  }
  .el-icon-error{
    font-size: 28px;
    position: absolute;
    z-index: 10;
  }
  .file {
    position: absolute;
    left: 0;
    height: 180px;
    width: 180px;
    z-index: 10;
    opacity: 0;
  }
  .upload_img{
    float: left;
    height: 180px;
    width: 180px;
    position: relative;
  }
   .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: absolute;
    overflow: hidden;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 180px;
    height: 180px;
    line-height: 180px;
    text-align: center;
  }
</style>
