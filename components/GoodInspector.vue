<template>
  <div
    :class="{closed : !open}"
    class="good-inspector">
    <div class="drawer">
      <transition>
        <div
          v-if="good"
          class="content">
          <good-item
            v-bind="good"
            :active="true"
            :preview="true"
            class="good-item" />

          <div class="infos">

            <h1>{{ good.name }}</h1>

            <div class="main">
              <div v-if="good.isOwned">
                <span class="label">Price:</span>
                <el-input-number
                  :disabled="good.forSale"
                  v-model="price"
                  :min="1"
                  controls-position="right"
                  @change="priceChanged()" />
                <el-switch
                  v-model="goodForSale"
                  :disabled="!good.confirmed"
                  active-text="For Sale"
                />
              </div>
              <div
                v-else
                class="buy">
                <span
                  v-if="hasPrice"
                  class="label" >Price:</span> <span
                    v-if="hasPrice"
                    class="price">{{ good.price }}₳</span>
                <el-button
                  v-if="good.forSale"
                  type="primary"
                  round
                  @click="buyGood(good)">BUY</el-button>
              </div>
            </div>

            <div class="footer">{{ good.id }}</div >

          </div>

          <el-button
            class="close-button"
            type="danger"
            icon="el-icon-close"
            circle
            @click="close()"/>

        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import GoodItem from "./GoodItem.vue";

export default {
  components: {
    "good-item": GoodItem,
  },
  props: {
    good: { type: Object, default: null },
  },
  computed: {
    open() {
      return this.good != null;
    },
    hasPrice() {
      return this.good && this.good.price && this.good.price.toString() != "0";
    },
    goodForSale: {
      set(forSale) {
        this.$store.dispatch("setGoodForSale", {
          id: this.good.id,
          forSale,
          price: this.good.price,
        });
      },
      get() {
        return this.good.forSale;
      },
    },
    price: {
      set(price) {
        this.$store.commit("setGoodPrice", { goodID: this.good.id, price });
      },
      get() {
        return this.good.price;
      },
    },
  },
  methods: {
    close() {
      this.$store.commit("selectedGoodId", null);
    },
    buyGood(good) {
      this.$store.dispatch("buyGood", good);
    },
    priceChanged() {
      // console.log("priceChanged", this.good.price);
    },
  },
};
</script>

<style lang="stylus" scoped>
.good-inspector
  background alpha(#f00,0.0)
  position relative
  pointer-events none
  overflow hidden
  >.drawer
    pointer-events initial
    background alpha(#f0f0f0,0.9)
    position absolute
    top 0px
    left 0px
    right 0px
    bottom 0px
    box-shadow 0px 0px 40px alpha(#000,0.1), 0px 0px 4px alpha(#000,0.1)
    transition all 300ms ease-in-out

    >.content
      position absolute
      top 0px
      left 0px
      right 0px
      bottom 0px

      padding 8px

      display flex
      flex-direction row
      flex-wrap nowrap
      justify-content flex-start
      align-content stretch
      align-items stretch

      >.close-button
        position absolute
        top 8px
        right 8px
        box-shadow 0px 1px 3px alpha(#000,0.2)

      >.good-item
        width 200px
        height 200px
        margin-right 8px

      >.infos
        flex 1 1 auto
        margin-right 48px

        display flex
        flex-direction column
        flex-wrap nowrap
        justify-content flex-start
        align-content stretch
        align-items stretch

        >h1
          // background alpha(#fff,0.8)
          height 40px
          line-height 30px
          text-transform uppercase
          font-weight bold
          border-bottom solid 1px rgba(#000,0.1)
          margin-bottom 16px
          text-indent: 8px

        >.main
          flex 1 1 auto
          margin-left 8px

          display flex
          flex-direction column
          flex-wrap nowrap
          justify-content center
          align-content stretch
          align-items stretch

          padding-bottom 16px
          >*
            >*
              margin-right 8px
          >.buy
            >.price
              margin-right 8px
              font-weight bold
              color darken(#409EFF, 10%)
              font-size 18px

        >.footer
          height 20px
          line-height 20px
          font-size 12px
          color #888
          white-space nowrap
          overflow hidden
          text-overflow ellipsis
          letter-spacing 0.1em
          // background-color alpha(#fff,0.5)
          border-top solid 1px rgba(#000,0.1)
          padding-top 4px
  &.closed
    >.drawer
      transform translate(0,100%)

</style>
