<template>
    <div>
      <h1>Lista de Íconos Disponibles</h1>
      <ul>
        <li v-for="icon in icons" :key="icon">
          <component :is="icon" /> {{ icon }}
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  import * as Icons from '@ant-design/icons-vue';
  
  export default {
    data() {
      return {
        icons: Object.keys(Icons),
      };
    },
    components: {
      ...Icons,
    },
  };
  </script>
  
  <style>
  ul {
    list-style: none;
    padding: 0;
  }
  li {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
  }
  li component {
    margin-right: 10px;
  }
  </style>
  