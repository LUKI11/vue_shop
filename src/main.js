import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入全局样式
import './assets/css/global.css'
import ZkTable from 'vue-table-with-tree-grid'

// 导入字体图标
import './assets/fonts/iconfont.css'

import axios from 'axios'

// 配置请求根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

// 需要授权的 API
axios.interceptors.request.use(config => {
    config.headers.Authorization = window.sessionStorage.getItem('token');
    // 最后必须return config
    return config
})
Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.component('tree-table', ZkTable)

new Vue({
    router,
    render: h => h(App)
}).$mount('#app')