<template>
    <a-space direction="vertical" size="large" style="width: 100%">
      <!-- Fila de abanicos -->
      <div style="display: flex; gap: 24px; justify-content: center; flex-wrap: wrap; width: 100%; padding: 16px 0">
        <div
          v-for="(id, index) in fanIds"
          :key="id"
          style="width: 900px; background: white; box-shadow: 0 4px 10px rgba(0,0,0,0.1); border-radius: 1rem; padding: 12px"
        >
          <FanControl :fanId="id" :label="`Abanico ${index + 1}`" />
        </div>
      </div>
  
      <!-- Fila de válvula -->
             <ValveControl />
   
  
    </a-space>
  </template>
  
  <script setup>
  import FanControl from './FanControl.vue'
  import ValveControl from './ValveControl.vue'
  
  const fanIds = ['abanico_uno', 'abanico_dos', 'abanico_tres']
  </script>
  
  <style scoped>
  </style>
  