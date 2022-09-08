import Vue from 'vue'
import Router from 'vue-router'
import Setting from '@/components/Setting.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: '设置',
      component: Setting
    }
  ]
})
