import { createRouter, createWebHistory } from 'vue-router'

import frameRoutes from './frames'
import route404 from './404'

// 글로벌 404 라우팅
const globalRoute404 = {
  ...route404,
  path: '/404'
}

const $router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/default/page/1'
    },
  
    // 프레임 하위 라우팅
    ...frameRoutes,
  
    // 루트 루트 404
    globalRoute404,
  
    // 비교할 수 없는 경로 404
    {
      path: '/:pathMatch(.*)*',
      redirect(to) {
        const match = /^(\/[^/]+\/)/.exec(to.path)
  
        if (match) {
          const base = match[1]
          const matchParent = $router.options.routes.find(
            item => item.path === base
          )
  
          // 404번 서브루트
          if (matchParent) return base + '404'
        }
  
        // 루트 루트 404
        return '/404'
      }
    }
  ]
})

export default $router
