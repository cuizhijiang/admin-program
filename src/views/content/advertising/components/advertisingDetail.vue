<template>
  <div class="tab-container">
     <el-form :inline="true" label-width="100px" label="left"  label-position="left" >
        <el-form-item class="width imgform" label="图片" >
        <div class="imgWrap" v-if="detail.image !== null">
          <i @click="removeImg"  v-if="detail.image" class="el-icon-delete"></i>
          <div></div>
          <img class="imgs" :src="detail.image" alt="">
        </div>
        <div class="upload_img" v-else>
          <input class="file" type="file" accept="image/*" @change="uploadImg" >
          <div class="el-icon-plus el-upload avatar-uploader-icon">
          </div>
        </div>
        </el-form-item>
        <el-form-item class="width" label="选择帖子" prop="title">
          <el-tag v-if="postTitle!==null" closable   @close="handleCloseTag()">
            {{postTitle}}
          </el-tag>
          <el-button v-else class="button-new-tag" size="small" @click="dialogCardVisible = true">选择帖子</el-button>
        </el-form-item>
        <el-form-item class="width" label="排序" prop="title">
          <el-input placeholder="请输入整数" v-model="detail.sort"></el-input>
        </el-form-item>
        <el-form-item label="备注">
          <el-input type="textarea" :rows="2" v-model="detail.remarks"></el-input>
        </el-form-item>
        <el-form-item class="width" label="状态">
          <el-switch
            v-model="detail.status"
            active-color="#409EFF"
            inactive-color="#dcdfe6" active-value="1" inactive-value="2">></el-switch>
        </el-form-item>
    </el-form>
    <div style="margin-top:50px;">
    <el-button type="primary" @click="submitForm()">保存</el-button>
    <el-button style="width:150px" @click="$router.push({path: '/content/advertising'})">返回上一页</el-button>
    </div>
    <el-dialog title="选择帖子" :visible.sync="dialogCardVisible">
      <card v-on:child-say="handleSelectionChange"></card>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleSelectCard">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
import axios from 'axios'
import { photoCompress, canvasDataURL, base64UrlToBlob } from '../../../../utils/agImg'
import card from './card'
export default {
  name: 'hot-word-detail',
  components: { card },
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      tempPostData: null,
      postTitle: null, // 帖子
      dialogCardVisible: false,
      detail: {
        id: null,
        image: null,
        sort: null,
        postId: null,
        remarks: null,
        status: '1' // 用户添加默认为生效状态
      }
    }
  },
  created() {
    if (this.isEdit) {
      this.detail.id = this.$route.query.id
      this.fetchData()
    }
  },
  methods: {
    async fetchData() {
      const params = {
        id: this.$route.query.id
      }
      const res = await this.$post('/advertising/query', params)
      if (res.returnCode === '1000') {
        this.detail = res.dataInfo
        console.log(this.detail)
        await this.getPost(this.detail.postId)
      }
    },
    async getPost(id) {
      const params = {
        id: id
      }
      const res = await this.$post('/post/query', params)
      if (res.returnCode === '1000') {
        this.postTitle = res.dataInfo.title
      }
    },
    async uploadImg(e) {
      if (this.detail.image) {
        return this.warning('只能上传一张图片')
      }
      const res = await photoCompress(e.target.files[0])
      canvasDataURL(res, (data) => {
        this.detail.image = data
        var param = new FormData()
        const blob = base64UrlToBlob(data) // 讲base转化为blob对象
        var config = {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
        param.append('fileData', blob, 'file_' + Date.parse(new Date()) + '.jpg')
        axios.post(`${this.$APPROOT}/moses/upload/file/upload`, param, config).then(res => {
          if (res.returnCode === '1000') {
            this.detail.image = res.dataInfo.url
          }
        })
      })
    },
    async submitForm() {
      if (!this.detail.image) {
        return this.warning('请选择添加图片')
      }
      if (!this.detail.postId) {
        return this.warning('请选择帖子')
      }
      if (this.detail.sort === null || this.detail.sort.trim() === '') {
        return this.warning('请输入排序')
      }
      if (!Number(this.detail.sort)) {
        return this.warning('请输入整数')
      }
      if (!Number.isInteger(Number(this.detail.sort))) {
        return this.warning('请输入整数')
      }
      if (this.detail.remarks === null || this.detail.remarks.trim() === '') {
        return this.warning('请输入备注')
      } else if (this.detail.remarks.trim().length > 120) {
        return this.warning('备注不能超过120个字')
      }
      const params = this.detail
      var postUrl = '/advertising/add'
      if (this.isEdit) {
        postUrl = '/advertising/update'
      }
      const res = await this.$post(postUrl, params)
      if (res.returnCode === '1000') {
        this.warning('成功', 'success')
        if (!this.isEdit) {
          this.resetData()
        }
      } else {
        this.warning(res.message, 'error')
      }
    },
    resetData() {
      this.tempPostData = null
      this.postTitle = null
      this.dialogCardVisible = false
      this.detail = {
        image: null,
        sort: null,
        postId: null,
        remarks: null,
        status: 1 // 用户添加默认为生效状态
      }
    },
    removeImg() {
      this.detail.image = null
    },
    handleSelectionChange(data) {
      if (data == null) {
        this.tempPostData = { title: null, id: null }
      } else {
        this.tempPostData = data
      }
    },
    handleSelectCard() {
      this.postTitle = this.tempPostData.title
      this.detail.postId = this.tempPostData.id
      this.dialogCardVisible = false
    },
    handleCloseTag() {
      this.postTitle = null
      this.detail.postId = null
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
    &:hover .el-icon-delete{
      opacity: 1;
    }
    .el-icon-delete{
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
