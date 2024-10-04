<template>
  <router-tab
    :class="{ 'is-fullscreen': fullscreen }"
    :contextmenu="contextmenu"
  />
</template>

<script>
// 전체 화면 믹스인 소개
import fullscreen from '../../mixins/fullscreen'

export default {
  mixins: [fullscreen],

  computed: {
    // 마우스 오른쪽 버튼 클릭 메뉴
    contextmenu() {
      return [
        // 내장 메뉴 사용
        'refresh',

        // 내장 메뉴 확장: 아이콘 추가
        {
          id: 'close',
          icon: 'rt-icon-close'
        },

        // 내장 메뉴 확장 : 실행 방법 수정
        {
          id: 'closeOthers',
          handler({ $menu }) {
            $menu.closeMulti($menu.others)
            alert('다른 탭 닫기')
          }
        },

        // 맞춤 메뉴
        {
          id: 'custom',
          title: '맞춤 메뉴',
          tips: '이것은 사용자 정의 작업입니다',
          icon: 'rt-icon-doc',
          class: 'custom-action',
          // 표시 여부. 제공되지 않은 경우 기본적으로 표시됩니다.
          visible(context) {
            return context.$tabs.items.length < 3
          },

          // 활성화 여부. 제공되지 않은 경우 기본적으로 활성화됩니다.
          enable(context) {
            return !(context.data.index % 2)
          },

          // 클릭 트리거
          handler(context) {
            console.log(context)
            alert('맞춤작업입니다. 콘솔을 확인하세요.')
          }
        },

        // 상태가 포함된 메뉴 - 전체 화면
        {
          id: 'fullscreen',
          title: () => (this.fullscreen ? '전체 화면 종료' : '전체 화면'),
          icon: () =>
            this.fullscreen ? 'rt-icon-fullscreen-exit' : 'rt-icon-fullscreen',

          // 클릭 트리거
          handler: () =>
            setTimeout(() => {
              this.fullscreen = !this.fullscreen
            }, 300)
        }
      ]
    }
  }
}
</script>