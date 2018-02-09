<template>
  <div class="tab-container">
    <el-form label-position="right"  label-width="100px">
      <el-form-item label="标题" >
        <el-input v-model="comment.postTitile" :disabled="true"></el-input>
      </el-form-item>
      <el-form-item label="正文" >
          <tinymce v-model="comment.postContent" :height=400  ref="editor" ></tinymce>
      </el-form-item>
      <el-form-item label="评论">
        <el-input v-model="comment.commentContent" type="textarea" :disabled="true" :autosize="{ minRows: 2}"></el-input>
      </el-form-item>
      <el-form-item label="回复">
        <el-input v-model="comment.replyContent" type="textarea"></el-input>
      </el-form-item>
    </el-form>
    <el-button type="primary"  @click="saveComment">保存</el-button>
    <el-button @click="$router.push({ path: '/cardmanagement/comment' })">返回上一页</el-button>
  </div>
</template>

<script>
// 不可编辑状态 window.tinymce.activeEditor.getBody().setAttribute('contenteditable',false);
import MDinput from '@/components/MDinput'
import Tinymce from '@/components/Tinymce'
export default {
  name: 'tab',
  components: {
    MDinput,
    Tinymce
  },
  data() {
    return {
      content: '',
      comment: {},
      createdBy: 666
    }
  },
  created() {
    this.getcomment()
  },
  mounted() {
    window.tinymce.activeEditor.getBody().setAttribute('contenteditable', false) // 不可编辑
  },
  methods: {
    showCreatedTimes() {
      this.createdTimes = this.createdTimes + 1
    },
    async getcomment() {
      const params = {
        id: this.$route.query.id
      }
      const res = await this.$post('/comment/query', params)
      this.comment = res.dataInfo
    },
    async saveComment() {
      if (this.comment.replyContent.trim() === '') {
        return this.warning('请输入回复内容')
      }
      const params = {
        id: this.$route.query.id,
        updatedBy: this.createdBy,
        replyContent: this.comment.replyContent
      }
      const res = await this.$post('/comment/update', params)
      if (res.returnCode === '1000') {
        this.warning('成功', 'success')
        this.$router.push({ path: '/cardmanagement/comment' })
      }
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

<style scoped>
  .tab-container{
    margin: 30px;
  }
  .width{
    width: 100%;
  }
</style>
