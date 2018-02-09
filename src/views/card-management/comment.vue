<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
        <el-form :inline="true"  class="demo-form-inline">
            <el-form-item label="标题">
                <el-input placeholder="标题" v-model="listQuery.postTitile" clearable></el-input>
            </el-form-item>
            <el-form-item label="时间">
                    <el-date-picker
                      v-model="time"
                      type="daterange"
                      range-separator="至"
                      start-placeholder="开始日期"
                      end-placeholder="结束日期">
                    </el-date-picker>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="search" icon="el-icon-search">搜索</el-button>
            </el-form-item>
        </el-form>
        <el-button class="filter-item" style="margin-left: 10px;" @click="batchDelete(null)" type="danger" icon="el-icon-edit">删除</el-button>
    </div>
    <el-table  :data="tableData" v-loading="listLoading" element-loading-text="给我一点时间" border fit highlight-current-row
      style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" ></el-table-column>
      <el-table-column align="center" label="标题">
        <template slot-scope="scope">
          <span>{{scope.row.postTitile}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="200px" align="center" label="评论">
        <template slot-scope="scope">
          <span>{{scope.row.commentContent}}</span>
        </template>
      </el-table-column>
      <el-table-column width="200px" align="center" label="评论时间">
        <template slot-scope="scope">
          <span>{{scope.row.createdTime | formatDate}}</span>
        </template>
      </el-table-column>
      <el-table-column width="360px" align="center" label="操作">
        <template slot-scope="scope">
          <el-button class="el-button--primary el-button--mini" @click="revertCemment(scope.row)" v-if="scope.row.replyContent==null">回复</el-button>
          <el-button class="el-button el-button--danger el-button--mini" @click="batchDelete(scope.row.id)">删除</el-button>
          <el-button class="el-button el-button--default el-button--mini" @click="$router.push({path: 'comment-detail', query:{id: scope.row.id}})">详情</el-button>
        </template>
      </el-table-column>   
    </el-table>
    <div v-show="!listLoading" class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="listQuery.pageNumber"
        :page-sizes="[10,20,30, 50]" :page-size="listQuery.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>
    <el-dialog title="热搜关键词" :visible.sync="revert" > 
      <el-form label-position="left" label-width="70px" style='width: 400px; margin-left:50px;'>
        <el-form-item class="filter-item" label="标题" prop="title">
          <el-input placeholder="标题" v-model="cemment.postTitile" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item  label="回复内容" prop="title">
          <el-input type="textarea" :autosize = '{ minRows: 2, maxRows: 6 }' :maxlength = "255" placeholder="回复内容0~255字符" v-model="replyContent"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" >
        <el-button  @click="revert = false">取 消</el-button>
        <el-button  type="primary" @click="saveCenment()" >确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import waves from '@/directive/waves' // 水波纹指令
export default {
  name: 'complexTable',
  directives: {
    waves
  },
  data() {
    return {
      tableData: [], // 模拟数据
      revert: false, // 控制用户导入dialog
      test: '', // select 测试
      total: 0, // 列表总数
      time: [],
      replyContent: '', // 回复内容
      cemment: {}, // 点击回复时获取内容
      createdBy: 666, // 通过登入获取 登入用户的id
      listLoading: false, // 控制loading
      businessType: [], // 业务标签列表
      customTag: [], // 自定义标签列表
      deleteData: [], // 需要删除的参数
      listQuery: { // 分页控制
        startTime: null,
        postTitile: null,
        pageNumber: 1,
        pageSize: 10,
        endTime: null,
        num: 1 // 判断是否有点击搜索 1 正常查询 2搜索查询
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    async getList() { // 用户列表数据 1 正常查询 2 搜索查询
      const params = { // 正常查询
        pageNumber: this.listQuery.pageNumber,
        pageSize: this.listQuery.pageSize
      }
      const searchParams = this.listQuery
      const res = await this.$post('/comment/page', this.listQuery.num === 1 ? params : searchParams)
      this.tableData = res.records
      this.total = Number(res.total)
    },
    revertCemment(item) {
      this.revert = true
      this.cemment = item
    },
    async saveCenment() { // 回复内容
      if (this.replyContent.trim() === '') {
        return this.warning('请输入回复内容')
      }
      const params = {
        id: this.cemment.id,
        updatedBy: this.createdBy,
        replyContent: this.replyContent
      }
      const res = await this.$post('/comment/update', params)
      if (res.returnCode === '1000') {
        this.warning('成功', 'success')
        this.revert = false
        this.replyContent = ''
        this.getList()
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
    handleFilter() {
      this.listQuery.pageNumber = 1
      this.getList()
    },
    handleSizeChange(val) {
      this.listQuery.pageSize = val
      this.getList()
    },
    handleCurrentChange(val) {
      this.listQuery.pageNumber = val
      this.getList()
    },
    search() { // 用户搜索
      if (this.time) {
        this.listQuery.startTime = new Date(this.time[0]).getTime()
        this.listQuery.endTime = new Date(this.time[1]).getTime()
      } else {
        this.listQuery.startTime = null
        this.listQuery.endTime = null
      }
      this.listQuery.num = 2
      this.getList()
    },
    handleSelectionChange(val) { // 获取选中的内容
      this.deleteData = val.map((item, index) => {
        return item.id
      })
    },
    async batchDelete(id) {
      const params = { updatedBy: this.createdBy }
      if (typeof id === 'string') {
        params.id = [id]
      } else {
        if (this.deleteData.length <= 0) {
          return
        }
        params.id = this.deleteData
      }
      this.$confirm('确定要删除吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        const res = await this.$post('/comment/remove', params)
        if (res.returnCode === '1000') {
          this.warning('删除成功', 'success')
          this.getList()
        }
      }).catch(() => {})
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
.file{
  position: absolute;
  width: 150px;
  height: 40px;
  left: 0;
  opacity: 0;
}
</style>

