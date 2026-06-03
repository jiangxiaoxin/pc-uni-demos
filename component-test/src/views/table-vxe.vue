<template>
  <div class="vxe-table-wrapper">
    <div class="search-form" :style="{height: expanded ? '200px' : '100px'}">
        <h1>搜索部分{{ tableData.length }}---{{ expanded }}</h1>
        <button @click="getData">load</button>
        <button @click="toggleSearch">toggle</button>
    </div>
    <div class="table-wrapper">
      <div class="table-con">
        <vxe-table :data="tableData" height="auto">
          <vxe-column type="seq" width="70"></vxe-column>
          <vxe-column field="id" title="id"></vxe-column>
          <vxe-column field="name" title="Name"></vxe-column>
          <vxe-column field="sex" title="Sex"></vxe-column>
          <vxe-column field="age" title="Age"></vxe-column>
          <vxe-column field="address" title="address"></vxe-column>
        </vxe-table>
      </div>
    </div>
    <div class="pager">
      <div style="background-color: blue">假装翻页部分</div>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { ref } from "vue";


  const expanded = ref(false)
  const toggleSearch = () => {
    expanded.value = !expanded.value
  }

  const tableData = ref([
    {
      id: 1,
      name: "Test1",
      role: "Develop",
      sex: "Man",
      age: 28,
      address: "test abc",
    },
    {
      id: 2,
      name: "Test2",
      role: "Test",
      sex: "Women",
      age: 22,
      address: "Guangzhou",
    },
    {
      id: 3,
      name: "Test3",
      role: "PM",
      sex: "Man",
      age: 32,
      address: "Shanghai",
    },
    {
      id: 4,
      name: "Test4",
      role: "Designer",
      sex: "Women",
      age: 24,
      address: "Shanghai",
    },
  ]);

  const getData = () => {
      const len = tableData.value.length;
      for (let i = 0; i < 10; i++) {
        tableData.value.push({
          id: len + i,
          name: `Test${len + i}`,
          role: "Develop",
          sex: "Man",
          age: 28,
          address: "test abc",
        });
      }
  }
</script>
<style lang="scss" scoped>
  .pager {
    background-color: red;
    padding: 20px 0;
  }

  .search-form {
    background-color: green;
    flex-shrink: 0;
    // height: 200px;
  }

  .vxe-table-wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  .table-wrapper {
    flex: 1;
    background-color: blue;
    min-height: 0;
    // overflow: scroll;
  }

  .table-con {
    width: 100%;
    height: 100%;
    overflow: hidden;
    background-color: pink;
  }
</style>
