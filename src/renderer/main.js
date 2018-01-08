import Vue from 'vue'
import http from './utils/http'
import MintUI from 'mint-ui'
import 'mint-ui/lib/style.css'

import App from './App'
import router from './router'
import store from './store'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))

Vue.use(MintUI)

Vue.http = Vue.prototype.$http = http
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
