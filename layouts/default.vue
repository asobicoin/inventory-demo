<template>
  <el-container class="host">
    <el-header class="main-header">
      <nuxt-link to="/">
        <div class="logo"/>
      </nuxt-link>
      <el-menu
        :router="true"
        :default-active="activeLink"
        class="main-menu"
        mode="horizontal">
        <el-menu-item index="/">
          <nuxt-link to="/">Inventory</nuxt-link>
        </el-menu-item>
        <el-menu-item index="/trading">
          <nuxt-link to="/trading">Trading</nuxt-link>
        </el-menu-item>
        <el-menu-item index="/friends">
          <nuxt-link to="/friends">Friends</nuxt-link>
        </el-menu-item>
        <el-menu-item index="/live">
          <nuxt-link to="/live">Live</nuxt-link>
        </el-menu-item>
        <el-menu-item index="/shop">
          <nuxt-link to="/shop">Shop</nuxt-link>
        </el-menu-item>
      </el-menu>
      <div class="balance"><span class="label">Balance:</span> <span class="value">{{ balance }}₳</span></div>
    </el-header>

    <nuxt class="content"/>

  </el-container>
</template>

<script>
export default {
  data() {
    return {};
  },
  computed: {
    activeLink() {
      return this.$route.path;
    },
    balance() {
      return this.$store.state.balance;
    },
  },
  created() {},
};
</script>


<style lang="stylus">
html, body
  height 100%

html
  font-size: 16px;
  word-spacing: 1px;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;

*, *:before, *:after
  box-sizing: border-box;
  margin: 0;

.host
  width 100vw
  height calc(100vh - 0px)
  overflow auto

.main-header
  .logo
    float left
    background url("/AsobiCoin.svg")
    background-repeat no-repeat
    background-position center center
    width 60px
    height 60px
    margin-right 8px

  .main-menu
    // background alpha(#f00,0.3)
    float left

  .balance
    font-size 18px
    float right
    line-height 60px
    .label
      color #aaa
    .value
      font-weight bold
      color darken(#409EFF, 10%)

</style>

