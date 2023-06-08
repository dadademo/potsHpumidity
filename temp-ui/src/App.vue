<template>
  <keep-alive>
    <component :is="compName" :timeQuery="timeQuery" />
  </keep-alive>

  <van-tabbar v-model="compName">
    <van-tabbar-item name="tempview" icon="tv-o">温度曲线</van-tabbar-item>
    <van-tabbar-item name="tempList" icon="notes-o">温度记录</van-tabbar-item>
  </van-tabbar>
</template>

<script>
import { Tabbar, TabbarItem } from "vant";
import tempview from "./components/home.vue";
import tempList from "./components/tempList.vue";
export default {
  name: "App",
  components: {
    [Tabbar.name]: Tabbar,
    [TabbarItem.name]: TabbarItem,
    tempview,
    tempList,
  },
  data() {
    return {
      compName: "tempview",
      timeQuery: "day",
      timeOptions: [
        { text: "本天", value: "day" },
        { text: "近一周", value: "week" },
        { text: "本月", value: "month" },
      ],
    };
  },
};
</script>

<style>
#app {
  background-color: #f7f8fa;
}
</style>
