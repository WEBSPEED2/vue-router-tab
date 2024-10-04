<template>
  <div class="router-tab__scroll" @wheel.prevent="onWheel" @mouseenter="update">
    <div
      ref="container"
      class="router-tab__scroll-container"
      :class="{ 'is-mobile': isMobile }"
      @scroll="update"
    >
      <slot />
    </div>

    <div
      v-show="hasScroller"
      ref="bar"
      class="router-tab__scrollbar"
      :class="{ 'is-dragging': dragData }"
    >
      <div
        ref="thumb"
        class="router-tab__scrollbar-thumb"
        :style="{
          width: `${thumbWidth}px`,
          transform: `translateX(${thumbLeft}px`
        }"
        @mousedown.prevent="onDragStart"
      />
    </div>
  </div>
</template>

<script>
import { scrollTo, scrollIntoView, getScrollbarWidth } from '../util'

// 스크롤바
export default {
  name: 'TabScroll',

  props: {
    // 매번 스크롤 거리
    space: {
      type: Number,
      default: 300
    }
  },

  data() {
    return {
      isMobile: false, // 모바일인지

      scrollData: {
        clientWidth: 0,
        scrollWidth: 0,
        scrollLeft: 0
      },

      dragData: null
    }
  },

  computed: {
    // 스크롤바 유무
    hasScroller() {
      return (
        !this.isMobile &&
        !this.$tabs.onDragSort &&
        this.scrollData.scrollWidth > this.scrollData.clientWidth
      )
    },

    // 슬라이더 폭
    thumbWidth() {
      if (!this.hasScroller) return

      const { clientWidth, scrollWidth } = this.scrollData
      return (clientWidth / scrollWidth) * clientWidth
    },

    // 슬라이더 왼쪽
    thumbLeft() {
      if (!this.hasScroller) return

      // 드래그 앤 스크롤
      if (this.dragData) {
        return this.dragData.thumbLeft
      }

      const { clientWidth, scrollWidth, scrollLeft } = this.scrollData

      return (
        (clientWidth - this.thumbWidth) *
        (scrollLeft / (scrollWidth - clientWidth))
      )
    }
  },

  mounted() {
    this.update()
  },

  methods: {
    // 롤링 데이터 업데이트
    update() {
      const { container } = this.$refs

      if (!container) return

      const { clientWidth, scrollWidth, scrollLeft } = container

      // 모바일인지 확인
      // userAgent에 모바일 필드가 포함되어 있거나 브라우저 스크롤 막대 너비가 0입니다.
      this.isMobile =
        /mobile/i.test(navigator.userAgent) || !getScrollbarWidth()

      Object.assign(this.scrollData, { clientWidth, scrollWidth, scrollLeft })
    },

    // 지정된 위치로 스크롤
    scrollTo(left, smooth = true) {
      scrollTo({ wrap: this.$refs.container, left, smooth })
    },

    // 요소로 스크롤
    scrollIntoView(el) {
      scrollIntoView({ el, wrap: this.$refs.container, inline: 'center' })
    },

    // 하위 노드가 가시 영역에 완전히 있는지 확인
    isInView(el) {
      const { container } = this.$refs
      const offsetLeft = el.offsetLeft
      const scrollLeft = container.scrollLeft

      if (
        offsetLeft < scrollLeft ||
        offsetLeft + el.clientWidth > scrollLeft + container.clientWidth
      ) {
        return false
      }

      return true
    },

    // 탭 마우스 스크롤
    onWheel(e) {
      const now = +new Date()
      const enable = now - (this.lastWheel || 0) > 100

      if (!enable) return

      this.lastWheel = now

      const { space } = this
      const isWheelUp = e.deltaY < 0

      this.scrollTo(
        this.$refs.container.scrollLeft + (isWheelUp ? -space : space)
      )
    },

    // 드래그
    onDragStart(e) {
      const { thumbLeft } = this

      this.dragData = {
        startPageX: e.pageX,
        startScrollLeft: this.$refs.container.scrollLeft,
        startThumbLeft: thumbLeft,
        thumbLeft
      }

      document.addEventListener('mousemove', this.onDragMove)
      document.addEventListener('mouseup', this.onDragEnd)
    },

    // 拖拽移动
    onDragMove(e) {
      const { dragData, thumbWidth } = this
      const { clientWidth, scrollWidth } = this.scrollData
      let thumbLeft = dragData.startThumbLeft + e.pageX - dragData.startPageX
      const maxThumbLeft = clientWidth - thumbWidth

      if (thumbLeft < 0) {
        thumbLeft = 0
      } else if (thumbLeft > maxThumbLeft) {
        thumbLeft = maxThumbLeft
      }

      // 슬라이더 위치 업데이트
      dragData.thumbLeft = thumbLeft

      // 스크롤
      this.scrollTo(
        (thumbLeft * (scrollWidth - clientWidth)) / (clientWidth - thumbWidth),
        false
      )

      e.preventDefault()
    },

    // 드래그 끝
    onDragEnd(e) {
      this.dragData = null

      document.removeEventListener('mousemove', this.onDragMove)
      document.removeEventListener('mouseup', this.onDragEnd)

      e.preventDefault()
    }
  }
}
</script>
