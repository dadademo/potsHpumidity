<template>
  <div>
    <van-nav-bar title="温度曲线">
      <template #right>
        <van-icon name="replay" @click="initData()" />
      </template>
    </van-nav-bar>
    <div class="home-comp-line">
      <van-dropdown-menu>
        <van-dropdown-item v-model="timeQuery" :options="timeOptions" />
      </van-dropdown-menu>
      <div ref="main" class="home-comp"></div>
    </div>
  </div>
</template>

<script>
import * as echarts from "echarts";
import { DropdownMenu, DropdownItem, NavBar, Icon } from "vant";
import { tempList } from "@/api/tempInfo.js";
import moment from "moment";
export default {
  name: "HomeComp",
  props: {},
  components: {
    [DropdownMenu.name]: DropdownMenu,
    [DropdownItem.name]: DropdownItem,
    [NavBar.name]: NavBar,
    [Icon.name]: Icon,
  },
  mounted() {
    this.initLine();
  },
  watch: {
    timeQuery() {
      this.initData();
    },
  },
  data() {
    return {
      active: "home",
      tempList: [],
      timeQuery: "day",
      timeOptions: [
        { text: "本天", value: "day" },
        { text: "近一周", value: "week" },
        { text: "本月", value: "month" },
      ],
    };
  },
  created() {
    this.initData();
  },
  methods: {
    initData() {
      let query = { all: true };
      if (this.timeQuery === "week" || this.timeQuery === "month") {
        query.startTimestamp = moment()
          .subtract({ week: 7, month: 31 }[this.timeQuery], "days")
          .startOf("day")
          .valueOf();
        query.endTimestamp = moment().endOf("day").valueOf();
      } else if (this.timeQuery === "day") {
        query.startTimestamp = moment().startOf(this.timeQuery).valueOf();
        query.endTimestamp = moment().endOf(this.timeQuery).valueOf();
      }
      tempList(query).then((res) => {
        if (res.status === 200) {
          this.tempList = res.list.map((item) => ({
            ...item,
            timeFormat: moment(item.time).format("YYYY-MM-DD HH:mm:ss"),
          }));
          this.initLine();
        }
      });
    },
    initLine() {
      var chartDom = this.$refs.main;
      var myChart = echarts.init(chartDom);
      const option = {
        tooltip: {
          trigger: "axis",
        },
        legend: {
          top: "3%",
          data: ["湿度"],
        },
        grid: {
          left: "10%",
          right: "10%",
          bottom: "10%",
          top: "10%",
          // containLabel: true,
        },
        // toolbox: {
        //   feature: {
        //     saveAsImage: {},
        //   },
        // },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: this.tempList.map((item) => item.timeFormat),
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            name: "湿度",
            type: "line",
            stack: "Total",
            smooth: true,
            areaStyle: {},
            emphasis: {
              focus: "series",
            },
            data: this.tempList.map((item) => item.temp),
          },
        ],
      };
      myChart.setOption(option);
    },
    // 选择时间
    onConfirm() {},
  },
};
</script>

<style>
.home-comp-line {
  /* width: 100vw;
  height: calc(100vh - 50px - 50px); */
  padding: 5px 0;
  height: calc(100vh - 46px - 50px);
}
.home-comp{
  height: calc(100vh - 46px - 50px - 5px - 48px);
}
</style>