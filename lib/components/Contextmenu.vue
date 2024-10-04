<template>
  <div
    class="router-tab__contextmenu"
    :class="{ 'has-icon': hasIcon }"
    :style="{
      left: `${data.left}px`,
      top: `${data.top}px`
    }"
  >
    <tab-contextmenu-item
      v-for="item in menuList"
      :key="item.id"
      :data="item"
    />
  </div>
</template>

<script>
import TabContextmenuItem from './ContextmenuItem.vue'
import menuMap, { defaultMenu } from '../config/contextmenu'

export default {
  name: 'TabContextmenu',
  components: { TabContextmenuItem },
  inject: ['$tabs'],

  props: {
    // 데이터를 마우스 오른쪽 버튼으로 클릭하세요.
    data: {
      type: [Boolean, Object]
    },

    // 메뉴 구성
    menu: {
      type: Array,
      default: () => defaultMenu
    }
  },

  computed: {
    // 메뉴 탭 활성화
    target() {
      return this.tabMap[this.data.id]
    },

    // 메뉴 옵션
    menuList() {
      return this.menu
        .map(item => {
          if (typeof item === 'string') {
            // 내장 메뉴
            return menuMap[item]
          } else if (item && item.id) {
            // 내장 메뉴 확장
            let origin = menuMap[item.id]
            return origin ? { ...origin, ...item } : item
          }
        })
        .filter(item => item)
    },

    // 아이콘 표시 여부
    hasIcon() {
      return this.menuList.some(item => item.icon)
    },

    // 탭 map
    tabMap() {
      return this.$tabs.$refs.tab.reduce((map, item) => {
        map[item.id] = item
        return map
      }, {})
    },

    // 탭 구성 요소 목록
    tabs() {
      return this.$tabs.items.map(item => this.tabMap[item.id])
    },

    // 왼쪽에는 닫을 수 있는 탭이 있습니다.
    lefts() {
      return this.tabs.slice(0, this.data.index).filter(item => item.closable)
    },

    // 오른쪽에는 닫을 수 있는 탭이 있습니다.
    rights() {
      return this.tabs.slice(this.data.index + 1).filter(item => item.closable)
    },

    // 기타 닫을 수 있는 탭
    others() {
      return this.tabs.filter(item => item.closable && this.data.id !== item.id)
    }
  },

  mounted() {
    this.adjust()
  },

  methods: {
    // 여러 탭 닫기
    async closeMulti(tabs) {
      for (let { id } of tabs) {
        try {
          await this.$tabs.removeTab(id)
        } catch (e) { /* empty */ }
      }

      // 현재 탭이 닫혀 있는 경우 마우스 오른쪽 버튼을 클릭하고 탭을 선택하여 엽니다.
      if (!this.$tabs.activeTab) {
        this.$router.replace(this.target.to)
      }
    },

    // 경계 위치에 적응
    adjust() {
      const { clientWidth } = this.$el
      const winWidth = window.innerWidth
      if (this.data.left + clientWidth > winWidth) {
        // eslint-disable-next-line vue/no-mutating-props
        this.data.left = winWidth - clientWidth - 5
      }
    }
  }
}
</script>
