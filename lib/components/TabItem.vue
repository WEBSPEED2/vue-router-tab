<template>
  <RouterLink :to="to" custom >
    <template #default="{ navigate }">
      <li
        :class="classList"
        :draggable="$tabs.dragsort"
        @click="navigate"
        @dragstart="onDragStart"
        @dragend="onDragEnd"
        @dragover.prevent="onDragOver"
        @dragleave.prevent="() => (isDragOver = false)"
        @drop.stop.prevent="onDrop"
        @click.middle="() => closable && close()"
        @contextmenu.prevent="e => $emit('contextmenu', e)"
      >
        <i v-if="icon" :class="['router-tab__item-icon', icon]" />
        <span class="router-tab__item-title" :title="tips">
          {{ title }}
        </span>
        <i
          v-if="closable"
          class="router-tab__item-close"
          @click.prevent.stop="close"
        />
      </li>
    </template>
  </RouterLink>
</template>

<script>
import { mapGetters } from '../util'

// 드래그 앤 드롭 전송 데이터 접두사
const TRANSFER_PREFIX = 'RouterTabDragSortIndex:'

// 드래그 앤 드롭 데이터 정렬
// 듀얼 코어 브라우저 호환 모드에서 dataTransfer.getData를 통해 데이터를 얻을 수 없는 문제를 해결하려면
let dragSortData = null

// 페이지 탭 항목
// @vue/component
export default {
  name: 'TabItem',
  inject: ['$tabs'],

  props: {
    // 슬롯 슬롯 맞춤 데이터에 편리한 원본 데이터 태그
    data: {
      type: Object,
      required: true
    },

    // 페이지 탭 항목 색인
    index: Number
  },

  data() {
    return {
      onDragSort: false, // 드래그 진행 중인지 여부
      isDragOver: false // 드래그할지 여부
    }
  },

  emits: ['contextmenu'],

  computed: {
    // this.data에서 계산된 속성을 추출합니다.
    ...mapGetters('data', ['id', 'to', 'icon', 'tabClass', 'target', 'href']),

    // class
    classList() {
      return [
        'router-tab__item',
        this.tabClass,
        {
          'is-active': this.$tabs.activeTabId === this.id,
          'is-closable': this.closable,
          'is-contextmenu': this.$tabs.contextData.id === this.id,
          'is-drag-over': this.isDragOver && !this.onDragSort
        }
      ]
    },

    // 국제화
    i18nText() {
      return this.$tabs.i18nText
    },

    // 이름 없는 탭
    untitled() {
      return this.$tabs.langs.tab.untitled
    },

    // 탭 제목
    title() {
      return this.i18nText(this.data.title) || this.untitled
    },

    // 탭 팁
    tips() {
      return this.i18nText(this.data.tips || this.data.title) || this.untitled
    },

    // 탭닫기
    closable() {
      const { keepLastTab, items } = this.$tabs
      return this.data.closable !== false && !(keepLastTab && items.length < 2)
    }
  },

  methods: {
    // 현재 탭 닫기
    close() {
      this.$tabs.closeTab(this.id)
    },

    // 드래그 시작
    onDragStart(e) {
      this.onDragSort = this.$tabs.onDragSort = true
      dragSortData = TRANSFER_PREFIX + this.index
      e.dataTransfer.setData('text', dragSortData)
      e.dataTransfer.effectAllowed = 'move'
    },

    // 拖拽悬浮
    onDragOver(e) {
      this.isDragOver = true
      e.dataTransfer.dropEffect = 'move'
    },

    // 拖拽结束
    onDragEnd() {
      this.onDragSort = this.$tabs.onDragSort = false
      dragSortData = null
    },

    // 드래그 후 정렬
    onDrop(e) {
      const { items } = this.$tabs
      const raw = e.dataTransfer.getData('text') || dragSortData

      this.isDragOver = false

      if (typeof raw !== 'string' || !raw.startsWith(TRANSFER_PREFIX)) return

      const fromIndex = raw.replace(TRANSFER_PREFIX, '')
      const tab = items[fromIndex]

      items.splice(fromIndex, 1)
      items.splice(this.index, 0, tab)
    }
  }
}
</script>