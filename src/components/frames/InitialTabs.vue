<template>
  <router-tab :tabs="tabs" />
</template>

<script>
export default {
  name: 'InitialTabs',
  data() {
    return {
      tabs: [
        // 전체 경로를 설정하기만 하면 프로그램이 라우터 구성에서 탭 제목/아이콘 및 기타 정보를 자동으로 가져옵니다.
        // (Nuxt 프로젝트의 페이지 메타 모드에서 구성된 탭 라우팅은 지원되지 않습니다)
        '/initial-tabs/page-leave',

        // Nuxt 프로젝트에는 탭 표시의 완전한 구성이 필요합니다.
        { to: '/initial-tabs/tab-dynamic', title: '비동기 탭', closable: false },

        // 동적 탭 제목이 있는 탭의 경우 탭에 들어간 후 제목이 일관되지 않도록 초기 탭 제목을 설정해야 합니다.
        { to: '/initial-tabs/page/1', title: '페이지 1' },

        // <router-link> location 모드 구성
        {
          to: {
            path: '/initial-tabs/page/2',
            query: { t: 2 }
          },

          title: '페이지 2'
        },

        // 기본 키 구성에서 이 탭은 '/initial-tabs/page/2' 탭의 키와 일치하며 처음 나타나는 탭만 유지됩니다.
        { to: '/initial-tabs/page/2?t=1', title: '페이지 2-1' },

        // 아이프레임 탭
        `/initial-tabs/iframe/${encodeURIComponent('https://v3-docs.vuejs-korea.org')}/Vue.js/rt-icon-web`
      ]
    }
  }
}
</script>