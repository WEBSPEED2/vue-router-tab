import { prunePath } from '../util'

// 기본 제공 규칙
export default {
  // 주소와 매개변수가 일치하지 않으면 독립적으로 캐시됩니다.
  path: route => route.path,

  // 전체 주소(해시 무시), 매개변수 또는 쿼리가 일치하지 않는 경우 독립적으로 캐시됩니다.
  fullpath: route => prunePath(route.fullPath)
}
