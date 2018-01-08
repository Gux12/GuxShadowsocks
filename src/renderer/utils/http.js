import {Indicator, Toast} from 'mint-ui'
import axios from 'axios'
// use node version axios
axios.defaults.adapter = require('axios/lib/adapters/http')

// Add a request interceptor
axios.interceptors.request.use(function (config) {
  // Do something before request is sent
  if (config.loading !== false) {
    Indicator.open('加载中...')
  }
  return config
}, function (error) {
  // Do something with request error
  return Promise.reject(error)
})

// Add a response interceptor
axios.interceptors.response.use(function (response) {
  // Do something with response data
  Indicator.close()
  return response
}, function (error) {
  Indicator.close()
  Toast({
    message: error.message,
    iconClass: 'icon icon-error'
  })
  // Do something with response error
  return Promise.reject(error)
})
export default axios
