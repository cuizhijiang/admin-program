<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
        <el-form :inline="true"  class="demo-form-inline">
            <el-form-item label="姓名">
                <el-input placeholder="姓名" v-model="listQuery.name"></el-input>
            </el-form-item>
            <el-form-item label="手机号">
                <el-input placeholder="手机号" v-model="listQuery.mobile"></el-input>
            </el-form-item>
            <el-form-item label="邮箱" >
                <el-input placeholder="邮箱" prop="email" v-model="listQuery.email"></el-input>
            </el-form-item>
            <el-form-item label="业务类型">
                <el-select clearable class="filter-item" style="width: 130px" v-model="listQuery.businessType" placeholder="业务类型">
                    <el-option label="全部" :value="null" ></el-option>
                    <el-option v-for="(item, index) in businessType" :label="item.tagName" :value="item.id" :key="index" ></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="用户类型">
                <el-select clearable class="filter-item" style="width: 130px" v-model="listQuery.userType" placeholder="类型">
                    <el-option label="全部" :value="null" ></el-option>
                    <el-option label="产品经理" value="产品经理" ></el-option>
                    <el-option label="客户经理" value="客户经理" ></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="所属部门">
                <el-select clearable class="filter-item" style="width: 130px" v-model="listQuery.department" placeholder="类型">
                    <el-option label="全部" :value="null" ></el-option>
                    <el-option label="电渠部" value="电渠部" ></el-option>
                    <el-option label="市场部" value="市场部" ></el-option>
                </el-select>
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
        <el-button class="filter-item" style="margin-left: 10px;" @click="handleCreate" type="primary" icon="el-icon-edit">添加</el-button>
        <el-button class="filter-item" style="margin-left: 10px;" @click="importUser" type="primary" icon="el-icon-upload">导入</el-button>
    </div>

    <el-table  :data="tableData" v-loading="listLoading" element-loading-text="给我一点时间" border fit highlight-current-row
      style="width: 100%">
      <el-table-column align="center" label="作者">
        <template slot-scope="scope">
          <span>{{scope.row.name}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="电话">
        <template slot-scope="scope">
          <span>{{scope.row.mobile}}</span>
        </template>
      </el-table-column>
      <el-table-column  align="center" label="邮箱">
        <template slot-scope="scope">
          <span>{{scope.row.email}}</span>
        </template>
      </el-table-column>
      <el-table-column  align="center" label="业务类型">
        <template slot-scope="scope">
          <span>{{scope.row.businessName}}</span>
        </template>
      </el-table-column>   
      <el-table-column  align="center" label="用户类型">
        <template slot-scope="scope">
          <span>{{scope.row.userType}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="所属部门">
        <template slot-scope="scope">
          <span>{{scope.row.department}}</span>
        </template>
      </el-table-column>
      <el-table-column width="110px" align="center" label="状态">
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
      <el-table-column width="220" align="center" label="操作">
        <template slot-scope="scope">
          <el-button class="el-button--warning el-button--mini" @click="force(scope.row)" v-if="scope.row.status === '1'">失效</el-button>
          <el-button class="el-button--success el-button--mini" @click="force(scope.row)" v-else>生效</el-button>
          <el-button class="el-button el-button--primary el-button--mini" @click="handleUpdate(scope.row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div v-show="!listLoading" class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="listQuery.pageNumber"
        :page-sizes="[10,20,30, 50]" :page-size="listQuery.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>
    
    <el-dialog :title="textMap[dialogStatus]"  :visible.sync="dialogFormVisible" >
      <el-form status-icon  :model="addUser" ref="dataForm" :rules="rules"  label-position="left" label-width="70px" style='width: 400px; margin-left:50px;'>
        <!-- 新增用户 -->
        <el-form-item label="姓名" prop="name" >
          <el-input v-model="addUser.name" placeholder="姓名"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile" >
          <el-input v-model.number="addUser.mobile" placeholder="手机号" auto-complete="off" ></el-input>
        </el-form-item>
        <el-form-item label="邮箱" >
          <el-input v-model="addUser.email" placeholder="邮箱" ></el-input>
        </el-form-item>
        <el-form-item  label="业务类型">
          <el-select style="width:100%" v-model="addUser.businessType"  placeholder="请选择">
            <el-option label="请选择业务类型" :value="null" ></el-option>
            <el-option v-for="(item, index) in businessType" :label="item.tagName" :value="item.id" :key="index" ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="用户类型">
          <el-select style="width:100%" v-model="addUser.userType"  placeholder="请选择">
            <el-option label="请选择用户类型" :value="null" ></el-option>
            <el-option label="产品经理" value="产品经理" ></el-option>
            <el-option label="客户经理" value="客户经理" ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="所属部门">
          <el-select style="width:100%" v-model="addUser.department" placeholder="请选择">
            <el-option label="请求选择所属部门" :value="null" ></el-option>
            <el-option label="政企客户部" value="政企客户部" ></el-option>
            <el-option label="政企客户部" value="政企客户部" ></el-option>
            <el-option label="宝山分公司" value="宝山分公司" ></el-option>
            <el-option label="北区分公司" value="北区分公司" ></el-option>
            <el-option label="崇明分公司" value="崇明分公司" ></el-option>
            <el-option label="嘉定分公司" value="嘉定分公司" ></el-option>
            <el-option label="南区分公司" value="南区分公司" ></el-option>
            <el-option label="青浦分公司" value="青浦分公司" ></el-option>
            <el-option label="金山分公司" value="金山分公司" ></el-option>
            <el-option label="松江分公司" value="松江分公司" ></el-option>
            <el-option label="西区分公司" value="西区分公司" ></el-option>
            <el-option label="奉贤分公司" value="奉贤分公司" ></el-option>
            <el-option label="闵行分公司" value="闵行分公司" ></el-option>
            <el-option label="浦东分公司" value="浦东分公司" ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注" >
          <el-input type="textarea" :maxlength='120' v-model="addUser.remarks" :autosize="{ minRows: 2, maxRows: 4}" placeholder="请输入内容120字" >
          </el-input>
        </el-form-item>
        <el-form-item label="是否生效">
          <el-switch
            v-model="addUser.status"
            active-color="#409EFF"
            inactive-color="#dcdfe6" active-value="1" inactive-value="2"></el-switch>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="createData">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 导入用户 -->
    <el-dialog title="批量导入" :visible.sync="importUserVisible" > 
      <el-form label-position="left" label-width="70px" style='width: 400px; margin-left:50px;'>
        <el-form-item class="filter-item" label="导入模板" prop="title">
          <el-button style="width: 150px" class="filter-item"  type="info" @click="download" >下载</el-button>
        </el-form-item>
        <el-form-item  label="选择文件" prop="title">
          <el-button style="width: 150px" type="info" class="uplod">{{excalName || '上传'}}</el-button>
          <input type="file" class="file" @change="importExcel">
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" >
        <el-button  @click="importUserVisible = false">取 消</el-button>
        <el-button  type="primary" @click="importData">确 定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import waves from '@/directive/waves' // 水波纹指令
const phoneRge = /^1[3|4|5|7|8][0-9]{9}$/
var mobile = (rule, value, callback) => {
  if (value == null || String(value).trim() === '') {
    callback(new Error('电话号码不能为空'))
  } else if (phoneRge.test(value) === false) {
    callback(new Error('电话号码格式不正确'))
  } else {
    callback()
  }
}
import axios from 'axios'

const defaultForm = {
  id: null,
  name: null,
  mobile: null,
  email: null,
  businessType: null,
  userType: null,
  department: null,
  remarks: null,
  status: '1', // 用户添加默认为生效状态
  createdBy: 666, // 通过登入获取
  updatedBy: null
}

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
      excalFile: null, // 上传表格数据formData
      excalName: null, // excal名字
      listLoading: false, // 控制loading
      businessType: [], // 业务标签列表
      listQuery: { // 分页控制
        pageNumber: 1,
        pageSize: 10,
        name: null,
        mobile: null,
        email: null,
        businessType: null,
        userType: null,
        department: null,
        status: null,
        num: 1 // 判断是否有点击搜索 1 正常查询 2搜索查询
      },
      addUser: Object.assign({}, defaultForm),
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '新增'
      },
      dialogFormVisible: false, // 添加用户dialog
      rules: {
        mobile: [
          { validator: mobile, trigger: 'blur' }
        ],
        name: [
          { required: true, message: '请输入活动名称', trigger: 'blur' },
          { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getList()
    this.getBusinessType()
  },
  methods: {
    async getList() { // 用户列表数据 1 正常查询 2 搜索查询
      const params = { // 正常查询
        pageNumber: this.listQuery.pageNumber,
        pageSize: this.listQuery.pageSize
      }
      const searchParams = this.listQuery
      const res = await this.$post('/user/page', this.listQuery.num === 1 ? params : searchParams)
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
      this.addUser = Object.assign({}, defaultForm)
    },
    handleCreate() { // 添加用户
      this.dialogStatus = 'create'
      this.resetAddUser()
      this.dialogFormVisible = true
    },
    handleUpdate(row) {
      this.dialogStatus = 'update'
      this.addUser = Object.assign({}, row)
      this.dialogFormVisible = true
    },
    importUser() { // 用户导入
      this.importUserVisible = true
    },
    search() { // 用户搜索
      this.listQuery.num = 2
      this.getList()
    },
    async importData() { // 点击确定上传excal
      if (!this.excalFile) {
        return false
      }
      const config = {
        headers: { 'Content-Type': 'multipart/form-data', 'Accept': '*' }
      }
      const res = await axios.post('/user/import', this.excalFile, config)
      if (res.returnCode === '1000') {
        this.warning('上传成功', 'success')
        this.importUserVisible = false
        this.excalFile = null
        this.excalName = null
        this.getList()
      }
    },
    force(item) { // 生效失效
      const params = {
        id: item.id,
        updatedBy: this.addUser.createdBy,
        status: item.status === '1' ? '2' : '1'
      }
      this.$post('/user/update', params).then(res => {
        if (res.returnCode === '1000') {
          this.warning('成功', 'success')
          this.getList()
        }
      })
    },
    createData() { // 新增用户
      if (!this.addUser.businessType) {
        return this.warning('请选择业务类型')
      }
      if (!this.addUser.userType) {
        return this.warning('请选择用户类型')
      }
      if (!this.addUser.department) {
        return this.warning('请选择所属部门')
      }
      this.$refs.dataForm.validate((valid) => {
        if (valid) {
          const params = this.addUser
          let postUrl = '/user/add'
          if (this.dialogStatus === 'update') {
            postUrl = '/user/update'
          }
          this.$post(postUrl, params).then(res => {
            if (res.returnCode === '1000') {
              this.dialogFormVisible = false
              this.warning(this.textMap[this.dialogStatus] + '成功', 'success')
              this.getList()
              this.resetAddUser()
              this.$refs.dataForm.resetFields()
            }
          })
        } else {
          this.warning('请把信息填写完整')
        }
      })
    },
    download() { // 用户模板下载
      window.location.href = `${axios.defaults.baseURL}/user/export`
    },
    importExcel(e) { // 上传用户Excel
      if (!(e.target.files[0].name.endsWith('.xls') || e.target.files[0].name.endsWith('.xlsx'))) {
        return this.warning('文件格式不对')
      }
      this.excalName = e.target.files[0].name
      const params = new FormData()
      params.append('createdBy', this.addUser.createdBy)
      params.append('uploadFile', e.target.files[0])
      this.excalFile = params
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
.uplod{
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>

