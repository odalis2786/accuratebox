<template>
  <div class="rounded-xl shadow-md p-4 bg-white flex flex-col items-center space-y-4">
    <h3 class="text-lg font-semibold">Válvula</h3>

    <div
      class="w-280 h-28 rounded-full border border-gray-300"
      style="background-image: url('../../img/valvula.jpg'); background-size: cover; background-position: center"
    ></div>

    <div class="flex gap-2 pt-2">
      <a-button type="primary" @click="() => handleValveToggle(1)">Abrir</a-button>
      <a-button type="default" danger @click="() => handleValveToggle(0)">Cerrar</a-button>
    </div>

    <div class="flex gap-2">
      <a-tag
        v-if="typeof state.automatico !== 'undefined'"
        :color="state.automatico === 1 ? 'green' : 'red'"
        class="font-semibold text-sm"
      >
        {{ state.automatico === 1 ? 'Auto' : 'Hand' }}
      </a-tag>

      <a-tag
        v-if="typeof state.encendido !== 'undefined'"
        :color="state.encendido === 1 ? 'red' : 'green'"
        class="font-semibold text-sm"
      >
        {{ state.encendido === 1 ? 'Válvula Abierta' : 'Válvula Cerrada' }}
      </a-tag>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useDatabaseStore } from '@/stores/database'
import { message } from 'ant-design-vue'

const dbStore = useDatabaseStore()
const state = ref({ encendido: 0, manual: 0, automatico: 1 })

const fetchValveState = async () => {
  const valveState = await dbStore.getValveState()
  state.value = valveState
}

const handleValveToggle = async (value) => {
  if (state.value.automatico === 0) {
    message.warning("Esta válvula no se puede operar desde la web. Está en modo Hand.");
    return;
  }
  await dbStore.setValveState(value)
  await fetchValveState()
}

onMounted(fetchValveState)
</script>
