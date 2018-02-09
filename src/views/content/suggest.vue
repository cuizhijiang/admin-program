<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
        <el-form :inline="true"  class="demo-form-inline">
            <el-form-item label="产品类型">
                <el-select clearable class="filter-item" style="width: 130px" v-model="listQuery.productTypeId" placeholder="产品类型">
                    <el-option label="全部" :value="null" ></el-option>
                    <el-option v-for="(item, index) in productType" :label="item.tagName" :value="item.id" :key="index" ></el-option>
                </el-select>
            </el-form-item>
            <el-form-item  label="提出者" prop="title">
             <el-input placeholder="提出者" v-model="listQuery.proposer" clearable></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="search" icon="el-icon-search">搜索</el-button>
            </el-form-item>
        </el-form>
        <el-button class="filter-item el-button el-button--danger" style="margin-left: 10px;" @click="batchDelete(null)" type="primary" icon="el-icon-delete">删除</el-button>
    </div>
       <el-table  :data="tableData" v-loading="listLoading" element-loading-text="给我一点时间" border fit highlight-current-row
      style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" ></el-table-column>
      <el-table-column  align="center" label="产品类型">
        <template slot-scope="scope">
          <span>{{scope.row.productType}}</span>
        </template>
      </el-table-column>
      <el-table-column  align="center" label="优化建议">
        <template slot-scope="scope">
          <span>{{scope.row.optimizingSuggestion}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="提出者">
        <template slot-scope="scope">
          <span>{{scope.row.proposer}}</span>
        </template>
      </el-table-column>
       <el-table-column align="center" label="时间">
        <template slot-scope="scope">
          <span>{{scope.row.createdTime | formatDate}}</span>
        </template>
      </el-table-column>
       <el-table-column width="220" align="center" label="操作">
        <template slot-scope="scope">
          <el-button class="el-button el-button--danger el-button--mini" @click="batchDelete(scope.row.id)">删除</el-button>
          <el-button class="el-button el-button--default el-button--mini" @click="handleUpdate(scope.row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div v-show="!listLoading" class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="listQuery.pageNumber"
        :page-sizes="[10,20,30, 50]" :page-size="listQuery.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>
    <el-dialog title="详情" :visible.sync="addWrod" > 
      <el-form label-position="left"  label-width="100px" style='width: 400px; margin-left:50px;'>
        <el-form-item label="产品类型">
          <el-input v-model="addUser.productType" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="优化建议">
          <el-input type="textarea" :autosize="{ minRows: 2}" v-model="addUser.optimizingSuggestion" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item class="width imgform" label="图片" >
             <div class="imgWrap">
               <div>
               </div>
               <img class="imgs" :src="addUser.image" alt="">
             </div>
        </el-form-item>
        <el-form-item label="时间" >
          <el-input v-model="formatCreatedTime" :disabled="true"></el-input>
        </el-form-item>
          <el-form-item label="需求提出者" >
          <el-input v-model="addUser.proposer" :disabled="true" ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" >
        <el-button  type="primary" @click="addWrod = false">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import waves from '@/directive/waves' // 水波纹指令
import * as filters from '@/filters' // 全局filter

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
      productType: [], // 业务标签列表
      deleteData: null, // 需要删除的参数
      listQuery: { // 分页控制
        pageNumber: 1,
        pageSize: 10,
        productTypeId: null,
        proposer: null,
        num: 1 // 判断是否有点击搜索 1 正常查询 2搜索查询
      },
      addUser: { // 增加用户信息
        name: null,
        sort: null,
        tagType: null,
        status: '1', // 用户添加默认为生效状态
        userId: 666 // 通过登入获取 登入用户的id
      }
    }
  },
  created() {
    this.getList()
    this.getProductType()
  },
  computed: {
    formatCreatedTime() {
      return filters.formatDate(this.addUser.createdTime)
    }
  },
  methods: {
    async getList() { // 用户列表数据 1 正常查询 2 搜索查询
      const params = { // 正常查询
        pageNumber: this.listQuery.pageNumber,
        pageSize: this.listQuery.pageSize
      }
      const searchParams = this.listQuery
      const res = await this.$post('/optimizingSuggestion/page', this.listQuery.num === 1 ? params : searchParams)
      this.tableData = res.records
      this.total = Number(res.total)
    },
    async getProductType() { // 获取产品类型
      const params = { }
      const res = await this.$post('/tag/page', params)
      this.productType = res.records
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
      const ids = val.map((item, index) => {
        return item.id
      })
      this.deleteData = ids.join()
    },
    handleUpdate(row) {
      this.dialogStatus = 'update'
      this.addUser = Object.assign({}, row)
      this.addWrod = true
    },
    batchDelete(id) { // 删除
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
        const res = await this.$post('/optimizingSuggestion/remove', params)
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
<style lang="scss" scoped>
.file{
  position: absolute;
  width: 150px;
  height: 40px;
  left: 0;
  opacity: 0;
}
.imgWrap{
  width: 180px;
  position: relative;
  float: left;
  .imgs{
    height: auto;
    max-width: 180px;
    object-fit: cover;
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
</style>

