<template>
  <div>
    <h2>동적 업데이트 탭</h2>

    <div class="form-item">
      <label>
        <p>탭 제목 수정</p>
        <input v-model="routeTab.title" type="text" />
      </label>
    </div>

    <div class="form-item">
      <label>
        <p>탭 팁 수정</p>
        <input v-model="routeTab.tips" type="text" />
      </label>
    </div>

    <div class="form-item tab-icons">
      <p>토글 아이콘</p>
      <a
        v-for="icon in icons"
        :key="icon"
        class="tab-icon"
        :class="`${icon === routeTab.icon ? 'is-active' : ''} ${icon}`"
        title="토글 아이콘"
        @click="routeTab.icon = icon"
      />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      routeTab: {
        title: '토글 아이콘',
        icon: 'rt-icon-log',
        tips: ''
      },

      icons: ['rt-icon-log', 'rt-icon-doc', 'rt-icon-contact']
    }
  }
}
</script>

<style lang="scss" scoped>
.form-item {
  margin-bottom: 1rem;

  p {
    margin: 0.5em 0;
  }
}

.tab-icons {
  a {
    margin-right: 1em;
    font-size: 20px;
    cursor: pointer;

    &.is-active {
      color: $color;
    }
  }
}
</style>
