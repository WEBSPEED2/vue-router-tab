<template>
  <div class="router-alive">
    <router-view
      ref="page"
      :class="pageClass"
      v-slot="{ Component }"
    >
      <keep-alive v-if="alive" ref="keepAlive" :max="max" :exclude="keepAliveExclude">
        <component
          v-if="!onRefresh"
          :is="Component"
          :key="key"
          ref="alive"
          @vue:created="pageHookCreated"
          @vue:mounted="pageHookMounted"
          @vue:activated="pageHookActivated"
          @vue:deactivated="pageHookDeactivated"
          @vue:unmounted="pageHookUnmounted"
          @page-loaded="onPageLoaded"
        />
      </keep-alive>
      <component v-else :is="Component" ref="alive" />
    </router-view>
  </div>
</template>

<script>
import { mapGetters, getTransOpt, getCtorId } from '../util'
import RouteMatch from '../util/RouteMatch'

/**
 * 경로 캐시 제어
 */
export default {
  name: 'RouterAlive',

  provide() {
    // 호출할 하위 구성 요소에 대한 인스턴스 제공
    return {
      RouterAlive: this
    }
  },

  props: {
    // 기본적으로 캐싱을 활성화할지 여부
    keepAlive: {
      type: Boolean,
      default: false
    },

    // 라우팅 구성요소 재사용 여부
    reuse: {
      type: Boolean,
      default: false
    },

    // 최대 캐시 수, 0은 무제한입니다.
    max: {
      type: Number,
      default: 0
    },

    // 페이지 class
    pageClass: {
      type: [Array, Object, String],
      default: 'router-alive-page'
    },

    // 페이지 스크롤 요소 선택기
    pageScroller: {
      type: String,
      default: ''
    },

    // 전환 효과
    transition: {
      type: [String, Object]
    },
  },

  emits: ['ready', 'change'],
  
  data() {
    // 캐시 레코드
    this.cache = {}

    return {
      // 경로 매칭 정보
      routeMatch: new RouteMatch(this),

      // 업데이트 중인가요?
      onRefresh: false,

      keepAliveExclude: null,
      keepAliveExcludeIndex: 1
    }
  },

  computed: {
    // this.routeMatch에서 계산된 속성을 추출합니다.
    ...mapGetters('routeMatch', [
      'key',
      'meta',
      'nest',
      'alive',
      'reusable',
      'basePath',
      'alivePath'
    ]),

    // 페이지 전환
    pageTrans() {
      return getTransOpt(this.transition)
    }
  },

  watch: {
    // 청취 경로
    $route: {
      handler($route, old) {
        // 구성 요소 준비
        if (!old) this.$emit('ready', this)

        if (!$route.matched.length) return

        const { key, alive, reusable, alivePath, nest } = this
        const cacheItem = this.cache[key] || {}
        let {
          alivePath: cacheAlivePath,
          fullPath: cacheFullPath,
          vm: cacheVM
        } = cacheItem

        // 재사용되지 않고 경로가 변경되는 경우 구성 요소 캐시를 정리합니다.
        if (cacheAlivePath && !reusable && cacheAlivePath !== alivePath) {
          cacheAlivePath = ''
          this.refresh(key)
        }

        // 중첩된 라우팅, 주소가 캐시와 일치하지 않습니다.
        if (nest && cacheVM && $route.fullPath !== cacheFullPath) {
          const oldKey = this.matchRoute(old).key
          if (oldKey !== key) {
            this.nestForceUpdate = true
          }
        }

        // 유형: 새 캐시 업데이트 또는 생성
        const type = cacheAlivePath ? 'update' : 'create'

        this.$emit('change', type, this.routeMatch)

        // 캐시 경로 업데이트
        if (alive) {
          cacheItem.fullPath = $route.fullPath
        }
      },

      immediate: true
    }
  },

  // 파괴 후 정리
  unmounted() {
    this.cache = null
    this.routeMatch = null
    this._match = null
  },

  methods: {
    // 캐시 제거
    async remove(key = this.key) {
      const $alive = this.$refs.alive

      if (!$alive) return

      const cacheItem = this.cache[key]

      // 캐시 구성 요소 인스턴스를 삭제하고 RouterAlive 캐시 레코드를 지웁니다.
      if (cacheItem) {
        // console.log('remove', key, cacheItem.vm.type.__name, cacheItem.vm.type.name, cacheItem.vm)
        let excludeName = cacheItem.vm.type.__name || cacheItem.vm.type.name
        if (!excludeName) {
          console.warn('missing name of component')
        }
        this.keepAliveExclude = excludeName
        cacheItem.vm = null
        this.cache[key] = null

        setTimeout(() => {
          this.keepAliveExclude = null
        }, 1000)
      }
    },

    // 새로 고치다
    refresh(key = this.key) {
      this.remove(key)

      // 현재가 아닌 캐시, 직접 제거
      if (key === this.key) {
        this.reload()
      }
    },

    // 다시 로드
    reload() {
      if (this.onRefresh) return

      this.onRefresh = true
    },

    // 캐시 페이지 구성 요소 후크
    pageHook(hook) {
      const handler = this[`pageHook:${hook}`]
      if (typeof handler === 'function') handler()
    },

    // 페이지 생성
    pageHookCreated() {
      // console.log('pageHookCreated')
      this.cache[this.key] = {
        alivePath: this.alivePath,
        fullPath: this.$route.fullPath
      }
    },

    // 페이지 마운트
    pageHookMounted(target) {
      // console.log('pageHookMounted')
      if (this.cache[this.key]) {
        this.cache[this.key].vm = target

        // 초기 스크롤 위치 재설정
        this.resetScrollPosition()
      } else {
        this.cache[this.key] = {
          alivePath: this.alivePath,
          fullPath: this.$route.fullPath,
          vm: target
        }
      }
    },

    // 페이지 활성화
    pageHookActivated(target) {
      // console.log('pageHookActivated')
      const pageVm = this.$refs.page

      // 핫 리로드 업데이트
      if (this.checkHotReloading(target, 'activated')) return

      // 페이지가 일치하지 않으면 중첩된 경로 캐시로 인해 강제 업데이트가 발생함
      if (this.nestForceUpdate) {
        delete this.nestForceUpdate
        pageVm.$forceUpdate()
      }

      // 스크롤 위치 복원
      this.restoreScrollPosition(target)
    },

    // 페이지 비활성화
    pageHookDeactivated(target) {
      // console.log('pageHookDeactivated')
      if (this.checkHotReloading(target, 'deactivated')) return

      // 스크롤 위치 저장
      this.saveScrollPosition(target)
    },

    // 페이지 파괴 후 캐시 정리
    async pageHookUnmounted() {
      // console.log('pageHookUnmounted')
      await this.$nextTick()

      if (!this.cache) return

      // 파괴된 페이지의 캐시 정보 지우기
      Object.entries(this.cache).forEach(([key, item]) => {
        const { vm } = item || {}
        if (vm && vm._isDestroyed) {
          this.remove(key)
        }
      })
      if (this.onRefresh) {
        // console.log('pageHookUnmounted onRefresh')
        this.onRefresh = false
        this.$emit('change', 'create', this.routeMatch)
      }
    },
    
    // 라우팅 정보 일치
    matchRoute($route) {
      const matched = this._match

      // 현재 경로
      if (
        $route === this.$route ||
        $route.fullPath === this.$route.fullPath ||
        $route === this.$route.fullPath
      ) {
        return this.routeMatch
      }

      if (matched) {
        matched.$route = $route
        return matched
      }

      return (this._match = new RouteMatch(this, $route))
    },

    // 핫 리로드 감지
    checkHotReloading(target, from) {
      const lastCid = target._lastCtorId
      const cid = (target._lastCtorId = getCtorId(target))

      // 핫 리로드 업데이트
      if (lastCid && lastCid !== cid) {
        this.refresh()
        return true
      }

      return false
    },

    // 스크롤 요소 가져오기
    getScroller(selector) {
      return selector.startsWith('$')
        ? document.querySelector(selector.replace(/^\$/, ''))
        : this.$el.querySelector(selector)
    },

    // 스크롤 위치 저장
    saveScrollPosition(target) {
      // 페이지 내부에 구성된 스크롤 요소
      let pageScroller = target.$options.pageScroller

      if (typeof pageScroller === 'string' && pageScroller.length) {
        pageScroller = pageScroller.split(/\s?,\s?/)
      }

      if (!Array.isArray(pageScroller)) {
        pageScroller = []
      }

      // 기본적으로 페이지 루트 노드 위치 저장
      pageScroller.push('.' + this.pageClass)

      // 전역 스크롤 요소 구성 추가
      // 구성 요소 외부 선택자는 $ 접두사를 사용하여 구분됩니다.
      if (this.pageScroller) {
        pageScroller.push('$' + this.pageScroller)
      }

      // 기록 위치
      const position = pageScroller.reduce((pos, selector) => {
        const el = this.getScroller(selector)

        if (el) {
          pos[selector] = {
            left: el.scrollLeft,
            top: el.scrollTop
          }
        }

        return pos
      }, {})

      target._pageScrollPosition = position
    },

    // 스크롤 위치 복원
    restoreScrollPosition(target) {
      const position = target?._pageScrollPosition

      if (!position) return

      Object.entries(position).forEach(([selector, pos]) => {
        const el = this.getScroller(selector)
        if (el) {
          this.$nextTick(() => {
            el.scrollLeft = pos.left
            el.scrollTop = pos.top
          })
        }
      })
    },

    // 전역 스크롤 위치 재설정
    resetScrollPosition() {
      if (!this.pageScroller) return

      const el = this.getScroller('$' + this.pageScroller)

      if (!el) return

      el.scrollLeft = 0
      el.scrollTop = 0
    },

    // 페이지 데이터가 성공적으로 로드되었습니다.
    async onPageLoaded() {
      await this.$nextTick()
      // 페이지 데이터가 성공적으로 로드된 후 스크롤 위치 복원
      this.restoreScrollPosition()
    }
  }
}
</script>