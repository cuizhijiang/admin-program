<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
        <el-form :inline="true"  class="demo-form-inline">
            <el-form-item label="标题">
                <el-input placeholder="标题" v-model="listQuery.title"></el-input>
            </el-form-item>
            <el-form-item label="作者">
                <el-input placeholder="作者" v-model="listQuery.author"></el-input>
            </el-form-item>
            <el-form-item label="业务类型">
                <el-select clearable class="filter-item" style="width: 130px" v-model="listQuery.businessTag" placeholder="业务类型">
                    <el-option label="全部" :value="null" ></el-option>
                    <el-option v-for="(item, index) in businessType" :label="item.tagName" :value="item.id" :key="index" ></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="自定义标签" >
                <el-select clearable class="filter-item" style="width: 130px" v-model="listQuery.customTag" placeholder="类型">
                    <el-option label="全部" :value="null" ></el-option>
                    <el-option v-for="(item, index) in customTag" :label="item.tagName" :value="item.id" :key="index" ></el-option>
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="search" >搜索</el-button>
            </el-form-item>
        </el-form>
    </div>
    <el-table ref="singleTable" :data="tableData" v-loading="listLoading" element-loading-text="给我一点时间" border fit highlight-current-row
      style="width: 100%" @current-change="handleSelectionChange">
      <el-table-column
      type="index"
      width="50">
    </el-table-column>
      <el-table-column align="center" label="标题">
        <template slot-scope="scope">
          <span>{{scope.row.title}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="作者">
        <template slot-scope="scope">
          <span>{{scope.row.author}}</span>
        </template>
      </el-table-column>
      <el-table-column  align="center" label="业务标签">
        <template slot-scope="scope">
          <span>{{scope.row.businessTagName}}</span>
        </template>
      </el-table-column>   
      <el-table-column  align="center" label="自定义标签">
        <template slot-scope="scope">
          <span>{{scope.row.customTagName}}</span>
        </template>
      </el-table-column>
      <el-table-column width="150px" align="center" label="状态">
        <template slot-scope="scope">
          <span>{{scope.row.status}}</span>
        </template>
      </el-table-column>
    </el-table>
    <div v-show="!listLoading" class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="listQuery.page"
        :page-sizes="[10,20,30, 50]" :page-size="listQuery.limit" layout="total, sizes, prev, pager, next, jumper" :total="total">
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
      total: 0, // 列表总数
      listLoading: false, // 控制loading
      businessType: [], // 业务标签列表
      customTag: [], // 自定义标签列表
      deleteData: [], // 需要删除的参数
      listQuery: { // 分页控制
        page: 1,
        limit: 10,
        title: null,
        author: null,
        businessTag: null,
        customTag: null,
        userType: null,
        referenceType: null,
        hot: null,
        top: null,
        status: null,
        num: 1 // 判断是否有点击搜索 1 正常查询 2搜索查询
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
        pageNumber: this.listQuery.page,
        pageSize: this.listQuery.limit,
        status: 1 // 只显示已生效的数据
      }
      const searchParams = { // 搜索查询
        pageNumber: this.listQuery.page,
        pageSize: this.listQuery.limit,
        title: this.listQuery.title,
        author: this.listQuery.author,
        businessTag: this.listQuery.businessTag,
        customTag: this.listQuery.customTag,
        userType: this.listQuery.userType,
        referenceType: this.listQuery.referenceType,
        hot: this.listQuery.userTyphote,
        top: this.listQuery.top,
        status: this.listQuery.status
      }
      const res = await this.$post('/post/page', this.listQuery.num === 1 ? params : searchParams)
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
      this.listQuery.page = 1
      this.getList()
    },
    handleSizeChange(val) {
      this.listQuery.limit = val
      this.getList()
    },
    handleCurrentChange(val) {
      this.listQuery.page = val
      this.getList()
    },
    search() { // 用户搜索
      this.listQuery.num = 2
      this.getList()
    },
    handleSelectionChange(val) { // 获取选中的内容
      var data = null
      if (val != null) {
        data = { title: val.title, id: val.id }
      }
      this.$emit('child-say', data)
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
.filter-container {
    padding-bottom:0;
}
</style>

