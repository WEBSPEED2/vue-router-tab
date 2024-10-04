<template>
  <div>
    <h2>패이지 {{ pageId }}</h2>
    <input type="text" />
  </div>
</template>


<script>
export default {
  name: 'Page',
  data() {
    const id = this.$route.params.id

    return {
      pageId: id
    }
  },

  methods: {
    click() {
      console.log(`페이지${this.pageId}`)
    }
  }
}
</script>
