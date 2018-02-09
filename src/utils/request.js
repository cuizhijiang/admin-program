import axios from 'axios'
import Vue from 'vue'
import { Message } from 'element-ui'
// 创建axios实例
const service = axios.create({
  baseURL: process.env.BASE_API, // api的base_url
  timeout: 5000 // 请求超时时间
})
var APPROOT = window.location.origin
if (APPROOT === 'http://localhost:9527') { // 接口配置 解决有些接口不一致
  APPROOT = 'http://devgw.vpclub.cn'
}
axios.defaults.baseURL = `${APPROOT}/shm/shanghai/bbs/consumer`
console.log(process.env.BASE_API)
console.log(process.env.APP_ORIGIN)
export const httpGet = (interfaceName, params) => axios({
  url: `${interfaceName}?${params}}`,
  method: 'get'
})

export const httpPost = (interfaceName, params) => axios({
  url: interfaceName,
  method: 'post',
  data: {
    ...params
  }
})
// request拦截器
service.interceptors.request.use(config => {
  axios.prototype.$loging = Vue.prototype.$loading({
    lock: true,
    text: 'Loading',
    spinner: 'el-icon-loading',
    background: 'rgba(0, 0, 0, 0.7)'
  })
  return config
}, error => {
  // Do something with request error
  console.log(error) // for debug
  Promise.reject(error)
})

// respone拦截器
axios.interceptors.response.use((response) => {
  axios.prototype.$loging.close()
  if (!response || response.status !== 200) return
  switch (response.data.returnCode * 1) {
    case 1000:
    case 1002: // 请求成功，但列表数据为空
    case 2009:
      return response.data
    case 1004:
      break
    case 2000:
      break
    case 1009:
      break
    default:
      return response.data
  }
  Message({
    message: response.data.message,
    type: 'error',
    duration: 3 * 1000
  })
  return response.data
}, (error) => {
  Message({
    message: error.message,
    type: 'error',
    duration: 3 * 1000
  })
  return Promise.reject(error)
})

export default service
