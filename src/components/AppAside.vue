<template>
  <aside class="app-sd">
    <div class="app-sd-menu">
      <menu-item v-for="(item, index) in menu" :key="index" :data="item" />
    </div>
  </aside>
</template>

<script>
import MenuItem from './MenuItem.vue'

import menu from '../config/menu'

export default {
  name: 'AppAside',
  components: { MenuItem },
  data() {
    return { menu }
  }
}
</script>

<style lang="scss" scoped>
.app-sd {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  background-color: rgba(#fff, 0.95);
  border-right: 1px solid #eaecef;

  &-menu {
    flex: auto;
    height: 0;
    padding-top: 1rem;
    overflow-y: auto;

    > .menu-group {
      margin-bottom: 1rem;
    }
  }
}
</style>
