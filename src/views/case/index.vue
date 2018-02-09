<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
        <el-form :inline="true"  class="demo-form-inline">
            <el-form-item label="案例标题">
                <el-input placeholder="案例标题" v-model="listQuery.caseTitle" clearable></el-input>
            </el-form-item>
            <el-form-item label="业务类型">
                <el-select clearable class="filter-item" style="width: 130px" v-model="listQuery.businessType" placeholder="业务类型">
                    <el-option label="全部" :value="null" ></el-option>
                    <el-option v-for="(item, index) in businessType" :label="item.tagName" :value="item.id" :key="index" ></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="案例提出者">
                <el-input placeholder="案例提出者" v-model="listQuery.caseProposerName" clearable></el-input>
            </el-form-item>
            <el-form-item label="是否热门">
                <el-select clearable class="filter-item" style="width: 130px" v-model="listQuery.hot" placeholder="是否热门">
                    <el-option label="全部" :value="null" ></el-option>
                    <el-option label="是" :value="1" ></el-option>
                    <el-option label="否" :value="2" ></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="是否置顶">
                <el-select clearable class="filter-item" style="width: 130px" v-model="listQuery.top" placeholder="是否置顶">
                    <el-option label="全部" :value="null" ></el-option>
                    <el-option label="是" :value="1" ></el-option>
                    <el-option label="否" :value="2" ></el-option>
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="search" icon="el-icon-search">搜索</el-button>
            </el-form-item>
        </el-form>
        <el-button class="filter-item" style="margin-left: 10px;" @click="batchDelete(null)" type="danger" icon="el-icon-delete">删除</el-button>
    </div>
    <el-table  :data="tableData" v-loading="listLoading" element-loading-text="给我一点时间" border fit highlight-current-row
      style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" ></el-table-column>
      <el-table-column width="160px" align="center" label="需求编号">
        <template slot-scope="scope">
          <span>{{scope.row.caseCode}}</span>
        </template>
      </el-table-column>
      <el-table-column width="110px" align="center" label="案例标题">
        <template slot-scope="scope">
          <span>{{scope.row.caseTitle}}</span>
        </template>
      </el-table-column>
      <el-table-column width="200px" align="center" label="业务类型">
        <template slot-scope="scope">
          <span>{{scope.row.businessType}}</span>
        </template>
      </el-table-column>   
      <el-table-column width="200px" align="center" label="案例描述">
        <template slot-scope="scope">
          <span>{{scope.row.caseDescription}}</span>
        </template>
      </el-table-column>
      <el-table-column width="110px" align="center" label="案例提出者">
        <template slot-scope="scope">
          <span>{{scope.row.caseProposerName}}</span>
        </template>
      </el-table-column>
      <el-table-column width="110px" align="center" label="有帮助数量">
        <template slot-scope="scope">
          <span>{{scope.row.helpfulAmount}}</span>
        </template>
      </el-table-column>
      <el-table-column width="110px" align="center" label="无帮助数量">
        <template slot-scope="scope">
          <span>{{scope.row.notHelpfulAmount}}</span>
        </template>
      </el-table-column>
      <el-table-column width="110px" align="center" label="是否热门">
        <template slot-scope="scope">
          <span>{{scope.row.hot==="1"?"是":"否"}}</span>
        </template>
      </el-table-column>
      <el-table-column width="110px" align="center" label="是否置顶">
        <template slot-scope="scope">
          <span>{{scope.row.top==="1"?"是":"否"}}</span>
        </template>
      </el-table-column>
      <el-table-column  align="center" label="时间">
        <template slot-scope="scope">
          <span>{{scope.row.createdTime | formatDate}}</span>
        </template>
      </el-table-column>
      <el-table-column width="440" align="center" label="操作">
        <template slot-scope="scope">
          <el-button class="el-button--warning el-button--mini" @click="Hot(scope.row)" v-if="scope.row.hot === '1'">取消热门</el-button>
          <el-button class="el-button--success el-button--mini" @click="Hot(scope.row)" v-else>热门</el-button>
          <el-button class="el-button--warning el-button--mini" @click="Top(scope.row)" v-if="scope.row.top === '1'">取消置顶</el-button>
          <el-button class="el-button--success el-button--mini" @click="Top(scope.row)" v-else>置顶</el-button>
          <el-button class="el-button el-button--danger el-button--mini" @click="batchDelete(scope.row.id)">删除</el-button>
          <el-button class="el-button el-button--default el-button--mini" @click="$router.push({path: 'case-dital', query:{id: scope.row.id}})">详情</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div v-show="!listLoading" class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="listQuery.pageNumber"
        :page-sizes="[10,20,30, 50]" :page-size="listQuery.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>
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
      importUserVisible: false, // 控制用户导入dialog
      test: '', // select 测试
      total: 0, // 列表总数
      listLoading: false, // 控制loading
      businessType: [], // 业务标签列表
      customTag: [], // 自定义标签列表
      deleteData: [], // 需要删除的参数
      listQuery: { // 分页控制
        pageNumber: 1,
        pageSize: 10,
        caseTitle: null,
        caseProposerName: null,
        businessType: null,
        customTag: null,
        userType: null,
        supportType: null,
        hot: null,
        top: null,
        status: null,
        num: 1 // 判断是否有点击搜索 1 正常查询 2搜索查询
      },
      addUser: { // 增加用户信息
        name: null,
        mobile: null,
        email: null,
        businessType: null,
        userType: null,
        department: null,
        remarks: null,
        status: 1, // 用户添加默认为生效状态
        createdBy: 666, // 通过登入获取 登入用户的id
        updatedBy: null
      }
    }
  },
  created() {
    this.getList()
    this.getBusinessType()
    this.getCustomTag()
  },
  methods: {
    async getList() { // 用户列表数据 1 正常查询 2 搜索查询
      const params = { // 正常查询
        pageNumber: this.listQuery.pageNumber,
        pageSize: this.listQuery.pageSize
      }
      const searchParams = this.listQuery
      const res = await this.$post('/caseTable/page', this.listQuery.num === 1 ? params : searchParams)
      this.tableData = res.records
      this.total = Number(res.total)
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
    Top(item) { // 置顶
      const params = {
        id: item.id,
        top: item.top === '1' ? '2' : '1',
        updatedBy: this.addUser.createdBy
      }
      this.$post('/caseTable/update', params).then(res => {
        if (res.returnCode === '1000') {
          this.warning('置顶成功', 'success')
          this.getList()
        }
      })
    },
    Hot(item) { // 热门
      const params = {
        id: item.id,
        hot: item.hot === '1' ? '2' : '1',
        updatedBy: this.addUser.createdBy
      }
      this.$post('/caseTable/update', params).then(res => {
        if (res.returnCode === '1000') {
          this.warning('置顶成功', 'success')
          this.getList()
        }
      })
    },
    reomve(item) { // 删除
      this.$post('/caseTable/batchDelete', { ids: item.id }).then(res => {
        if (res.returnCode === '1000') {
          this.warning('删除成功', 'success')
          this.getList()
        }
      })
    },
    resetAddUser() { // 重置添加用户的数据
      this.addUser.name = null
      this.addUser.mobile = null
      this.addUser.email = null
      this.addUser.businessType = null
      this.addUser.userType = null
      this.addUser.department = null
      this.addUser.remarks = null
    },
    handleCreate() { // 添加用户
      this.dialogFormVisible = true
    },
    importUser() { // 用户导入
      this.importUserVisible = true
    },
    search() { // 用户搜索
      this.listQuery.num = 2
      this.getList()
    },
    createData() {

    },
    handleSelectionChange(val) { // 获取选中的内容
      this.deleteData = val.map((item, index) => {
        return item.id
      })
    },
    async batchDelete(id) {
      if (!id) {
        if (this.deleteData.length <= 0) {
          return
        }
      }
      const params = {
        ids: id || this.deleteData.join()
      }
      this.$confirm('确定要删除吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        const res = await this.$post('/caseTable/batchDelete', params)
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

