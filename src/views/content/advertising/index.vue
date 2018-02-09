<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
        <el-form :inline="true"  class="demo-form-inline">
            <el-form-item label="标题">
                <el-input placeholder="标题" v-model="listQuery.title" clearable></el-input>
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
        <router-link :to="{ path: 'advertising-create'}">
          <el-button class="filter-item" style="margin-left: 10px;"  type="primary" icon="el-icon-edit">新增</el-button>
        </router-link>
        <el-button class="filter-item el-button el-button--danger" style="margin-left: 10px;" @click="batchDelete(null)" type="primary" icon="el-icon-delete">删除</el-button>
    </div>
    <el-table  :data="tableData" v-loading="listLoading" element-loading-text="给我一点时间" border fit highlight-current-row
      style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" ></el-table-column>
      <el-table-column  align="center" label="标题">
        <template slot-scope="scope">
          <span>{{scope.row.title}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="排序">
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
          <el-button class="el-button el-button--primary el-button--mini" @click="$router.push({path: 'advertising-edit', query:{id: scope.row.id}})">编辑</el-button>
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
      total: 0, // 列表总数
      listLoading: false, // 控制loading
      businessType: [], // 业务标签列表
      customTag: [], // 自定义标签列表
      deleteData: null, // 需要删除的参数
      listQuery: { // 分页控制
        pageNumber: 1,
        pageSize: 10,
        status: null,
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
      const res = await this.$post('/advertising/page', this.listQuery.num === 1 ? params : searchParams)
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
    search() { // 用户搜索
      this.listQuery.num = 2
      this.getList()
    },
    handleSelectionChange(val) { // 获取选中的内容
      console.log(val)
      const ids = val.map((item, index) => {
        return item.id
      })
      this.deleteData = ids.join()
    },
    async batchDelete(id) { // 删除帖子
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
        const res = await this.$post('/advertising/remove', params)
        if (res.returnCode === '1000') {
          this.warning('删除成功', 'success')
          this.getList()
        }
      }).catch(() => {})
    },
    async force(item) {
      const params = {
        id: item.id,
        status: item.status === '1' ? '2' : '1'
      }
      const res = await this.$post('/advertising/update', params)
      if (res.returnCode === '1000') {
        this.warning('成功', 'success')
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

