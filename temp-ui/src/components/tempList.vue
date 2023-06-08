<template>
  <div class="temp-list-comp-body">
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <van-cell
          v-for="item in list"
          :key="item"
          :title="item.timeFormat"
          :value="`${item.temp}℃`"
        />
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script>
import { List, PullRefresh, Cell } from "vant";
import { ref } from "vue";
import { tempList } from "@/api/tempInfo.js";
import moment from "moment";
export default {
  name: "tempListComp",
  components: {
    [List.name]: List,
    [PullRefresh.name]: PullRefresh,
    [Cell.name]: Cell,
  },
  setup() {
    const list = ref([]);
    const loading = ref(false);
    const finished = ref(false);
    const refreshing = ref(false);
    const query = { pageIndex: 0, pageSize: 20 };

    const onLoad = () => {

      if (refreshing.value) {
        query.pageIndex = 0;
        list.value = [];
        refreshing.value = false;
      }
      

      query.pageIndex = query.pageIndex + 1;
      tempList(query).then((res) => {
        if (res.status === 200) {
          let listcopy = res.list.map((item) => ({
            ...item,
            timeFormat: moment(item.time).format("YYYY-MM-DD HH:mm:ss"),
          }));
          list.value.push(...listcopy);
          loading.value = false;
          if (!listcopy.length) {
            finished.value = true;
          }
        }
      });
    };

    const onRefresh = () => {
      // 清空列表数据
      finished.value = false;
      // 重新加载数据
      // 将 loading 设置为 true，表示处于加载状态
      loading.value = true;
      // onLoad();
      query.pageIndex = 1;
      tempList(query).then((res) => {
        if (res.status === 200) {
          list.value = res.list.map((item) => ({
            ...item,
            timeFormat: moment(item.time).format("YYYY-MM-DD HH:mm:ss"),
          }));
        }
        loading.value = false;
      });
    };

    return {
      list,
      onLoad,
      loading,
      finished,
      onRefresh,
      refreshing,
    };
  },
};
</script>

<style>
.temp-list-comp-body {
  height: calc(100vh - 50px );
}
</style>