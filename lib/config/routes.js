import Iframe, { iframeMeta } from '../page/Iframe.vue'

// 주입된 경로
export default [
  {
    // iframe 라우팅
    path: 'iframe/:src/:title?/:icon?',
    component: Iframe,
    props: true,
    meta: iframeMeta
  }
]

export { Iframe }
