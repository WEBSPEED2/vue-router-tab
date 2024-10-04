<template>
  <div>
    <h2>페이지 떠나기 확인</h2>

    <page-timer />

    <p>
      탭이 닫히거나 새로 고쳐지거나 교체될 때 페이지에서 프롬프트를 확인합니다.
    </p>

    <p>
      <a class="demo-btn" @click="$tabs.refresh(null, true, false)">
        새로고침 탭 
      </a>

      <a class="demo-btn" @click="$tabs.close({ force: false })">
        탭 닫기
      </a>

      <router-link class="demo-btn" :to="`?id=${+($route.query.id || 0) + 1}`">
        탭 바꾸기
      </router-link>

      <router-link class="demo-btn" to="/default/page/1">
        결로이탈
      </router-link>

      <a class="demo-btn" @click="reload">
        브라우즈 새로고침
      </a>
    </p>
  </div>
</template>

<script>
import PageTimer from '../components/PageTimer.vue'

export default {
  name: 'PageLeave',
  components: { PageTimer },

  /**
   * 页面离开前确认
   * @param {Object} tab 页签信息
   * @param {String} type 离开类型：
   *   close: 页签关闭
   *   refresh: 页签刷新
   *   replace: 页签被替换
   *   leave: 路由离开
   *   unload: 浏览器刷新或者关闭
   * @returns {String|Promise}
   */
  beforePageLeave(tab, type) {
    // 浏览器窗口刷新或者关闭时，支持的浏览器会展示确认消息
    if (type === 'unload') {
      return `您在“${tab.title}”页签的更改尚未完成，是否要离开？`
    }

    // 离开类型
    const action = {
      close: '关闭',
      refresh: '刷新',
      replace: '替换',
      leave: '离开'
    }[type]

    const msg = `您确认要${action}页签“${tab.title}”吗？`

    // 返回 promise，resolve 离开，reject 阻止离开
    return new Promise((resolve, reject) => {
      // 值改变则确认提示
      if (confirm(msg)) {
        resolve()
      } else {
        reject(`您拒绝了${action}页签`)
      }
    })

    // 此处使用了 Element 的 confirm 组件
    // 需将 closeOnHashChange 配置为 false，以避免路由切换导致确认框关闭
    // return this.$confirm(msg, '提示', { closeOnHashChange: false })
  },

  methods: {
    // 浏览器刷新
    reload() {
      location.reload()
    }
  }
}
</script>
