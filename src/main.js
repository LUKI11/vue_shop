import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入全局样式
import './assets/css/global.css'
import ZkTable from 'vue-table-with-tree-grid'

// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 导入富文本编辑器对应yangshi
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

// 导入字体图标
import './assets/fonts/iconfont.css'

// 导入全局echarts
import * as echarts from 'echarts'; //引入echarts
Vue.prototype.$echarts = echarts //引入组件

import axios from 'axios'

// 配置请求根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

// 需要授权的 API
axios.interceptors.request.use(config => {
    config.headers.Authorization = window.sessionStorage.getItem('token')
        // 最后必须return config
    return config
})
Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.component('tree-table', ZkTable)
    // 富文本的全局注册
Vue.use(VueQuillEditor /* { default global options } */ )

// 全局时间处理过滤器
Vue.filter('dataFormat', function(originVal) {
    const dt = new Date(originVal)
    const year = dt.getFullYear()
    const month = (dt.getMonth() + 1 + '').padStart(2, '0')
    const day = (dt.getDay() + '').padStart(2, '0')
    const hh = (dt.getHours() + '').padStart(2, '0')
    const min = (dt.getMinutes() + '').padStart(2, '0')
    const sec = (dt.getSeconds() + '').padStart(2, '0')

    return `${year}-${month}-${day} ${hh}:${min}:${sec}`
})

new Vue({
    router,
    render: h => h(App)
}).$mount('#app')