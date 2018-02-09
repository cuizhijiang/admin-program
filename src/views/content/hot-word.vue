<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
        <el-form :inline="true"  class="demo-form-inline">
            <el-form-item label="标题">
                <el-input placeholder="标题" v-model="listQuery.name" clearable></el-input>
            </el-form-item>
            <el-form-item label="状态">
                <el-select clearable class="filter-item" style="width: 130px" v-model="listQuery.status" placeholder="类型">
                    <el-option label="全部" :value="null" ></el-option>
                    <el-option label="生效" value="1" ></el-option>
                    <el-option label="失效" value="2" ></el-option>
                </el-select>
            </el-form-item>

            <el-form-item>
                <el-button type="primary" @click="search" icon="el-icon-search">搜索</el-button>
            </el-form-item>
        </el-form>
        <el-button class="filter-item" style="margin-left: 10px;" @click="handleCreate" type="primary" icon="el-icon-edit">新增</el-button>
        <el-button class="filter-item el-button el-button--danger" style="margin-left: 10px;" @click="batchDelete(null)" type="primary" icon="el-icon-delete">删除</el-button>
    </div>
    <el-table  :data="tableData" v-loading="listLoading" element-loading-text="给我一点时间" border fit highlight-current-row
      style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" ></el-table-column>
      <el-table-column  align="center" label="名称">
        <template slot-scope="scope">
          <span>{{scope.row.name}}</span>
        </template>
      </el-table-column>
      <el-table-column  align="center" label="排序">
        <template slot-scope="scope">
          <span>{{scope.row.sort}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="状态">
        <template slot-scope="scope">
          <el-tag type="success" v-if="scope.row.status==='1'">已生效</el-tag>
          <el-tag type="info" v-else>已失效</el-tag>
        </template>
      </el-table-column>
       <el-table-column align="center" label="时间">
        <template slot-scope="scope">
          <span>{{scope.row.createdTime | formatDate}}</span>
        </template>
      </el-table-column>
       <el-table-column width="330" align="center" label="操作">
        <template slot-scope="scope">
          <el-button class="el-button--warning el-button--mini" @click="force(scope.row)" v-if="scope.row.status === '1'">失效</el-button>
          <el-button class="el-button--success el-button--mini" @click="force(scope.row)" v-else>生效</el-button>
          <el-button class="el-button el-button--danger el-button--mini" @click="batchDelete(scope.row.id)">删除</el-button>
          <el-button class="el-button el-button--primary el-button--mini" @click="handleUpdate(scope.row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div v-show="!listLoading" class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="listQuery.pageNumber"
        :page-sizes="[10,20,30, 50]" :page-size="listQuery.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="addWrod" > 
      <el-form label-position="left" label-width="70px" style='width: 400px; margin-left:50px;'>
        <el-form-item class="filter-item" label="名称" prop="title">
          <el-input placeholder="名称" v-model="addUser.name"></el-input>
        </el-form-item>
        <el-form-item  label="排序" prop="title">
          <el-input placeholder="请输入整数" v-model="addUser.sort"></el-input>
        </el-form-item>
        <el-form-item label="是否生效">
          <el-switch
            v-model="addUser.status"
            active-color="#409EFF"
            inactive-color="#dcdfe6" active-value="1" inactive-value="2"></el-switch>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" >
        <el-button  @click="addWrod = false">取 消</el-button>
        <el-button  type="primary" @click="createData">确 定</el-button>
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
      addWrod: false, // 控制新增关键词
      test: '', // select 测试
      total: 0, // 列表总数
      listLoading: false, // 控制loading
      businessType: [], // 业务标签列表
      customTag: [], // 自定义标签列表
      deleteData: null, // 需要删除的参数
      listQuery: { // 分页控制
        pageNumber: 1,
        pageSize: 10,
        status: null,
        name: null,
        num: 1 // 判断是否有点击搜索 1 正常查询 2搜索查询
      },
      addUser: { // 增加用户信息
        name: null,
        sort: null,
        status: '1', // 用户添加默认为生效状态
        userId: 666 // 通过登入获取 登入用户的id
      },
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '新增'
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
      const res = await this.$post('/hotSearchKeyword/page', this.listQuery.num === 1 ? params : searchParams)
      this.tableData = res.records
      this.total = Number(res.total)
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
    resetAddUser() { // 重置添加用户的数据
      this.addUser.name = null
      this.addUser.sort = null
    },
    handleCreate() { // 添加用户
      this.dialogStatus = 'create'
      this.resetAddUser()
      this.addWrod = true
    },
    handleUpdate(row) {
      this.dialogStatus = 'update'
      this.addUser = Object.assign({}, row)
      this.addWrod = true
    },
    importUser() { // 用户导入
      this.importUserVisible = true
    },
    search() { // 用户搜索
      this.listQuery.num = 2
      this.getList()
    },
    async createData() { // 添加关键字
      console.log(this.addUser)
      if (this.addUser.name === null || this.addUser.name.trim() === '') {
        return this.warning('请输入名字')
      }
      if (this.addUser.name.length > 10) {
        return this.warning('名字请控制在10个字以内')
      }
      if (this.addUser.sort === null || this.addUser.sort.trim() === '') {
        return this.warning('请输入排序')
      }
      if (!Number(this.addUser.sort)) {
        return this.warning('请输入整数')
      }
      if (!Number.isInteger(Number(this.addUser.sort))) {
        return this.warning('请输入整数')
      }
      const params = this.addUser
      var postUrl = '/hotSearchKeyword/add'
      if (this.dialogStatus === 'update') {
        postUrl = '/hotSearchKeyword/update'
      }
      const res = await this.$post(postUrl, params)
      if (res.returnCode === '1000') {
        this.warning('成功', 'success')
        this.getList()
        this.resetAddUser()
        this.addWrod = false
      }
    },
    handleSelectionChange(val) { // 获取选中的内容
      const ids = val.map((item, index) => {
        return item.id
      })
      this.deleteData = ids.join()
    },
    async batchDelete(id) {
      if (typeof id !== 'string') {
        if (this.deleteData === null || this.deleteData.trim() === '') {
          return
        }
      }
      this.$confirm('确定要删除吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        const params = {
          ids: id || this.deleteData
        }
        const res = await this.$post('/hotSearchKeyword/remove', params)
        if (res.returnCode === '1000') {
          this.warning('删除成功', 'success')
          this.getList()
        }
      }).catch(() => {})
    },
    async force(item) {
      const params = {
        id: item.id,
        userId: this.addUser.userId,
        status: item.status === '1' ? '2' : '1'
      }
      const res = await this.$post('/hotSearchKeyword/update', params)
      if (res.returnCode === '1000') {
        this.warning(this.textMap[this.dialogStatus] + '成功', 'success')
        this.getList()
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
.file{
  position: absolute;
  width: 150px;
  height: 40px;
  left: 0;
  opacity: 0;
}
</style>

