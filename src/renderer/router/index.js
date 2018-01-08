import Vue from 'vue'
import Router from 'vue-router'
import store from '../store'

Vue.use(Router)

let routes = new Router({
  routes: [
    {
      path: '/',
      name: 'index',
      component: require('@/components/Index').default
    },
    {
      path: '/main',
      name: 'main-panel',
      component: require('@/components/Main').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})

routes.beforeEach((to, from, next) => {
  if (to.path !== '/') {
    if (store.state.User.cookie) {
      if (to.path === '/') {
        next('/main')
      } else {
        next()
      }
    } else {
      next('/')
    }
  } else {
    next()
  }
})

export default routes
