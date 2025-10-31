<template>
    <div class="rounded-xl shadow-md p-4 bg-white flex flex-col items-center space-y-4">
      <h3 class="text-lg font-semibold">{{ label }}</h3>
  
      <div class="w-32 h-32 rounded-full overflow-hidden">
        <video
          ref="fanVideo"
          :src="videoSrc"
          class="object-cover w-full h-full"
          loop
          muted
          playsinline
        />
      </div>
  
      <a-switch
        :checked="state.encendido === 1"
        checked-children="ON"
        un-checked-children="OFF"
        @change="toggleFan"
      />
       

      <!-- SIEMPRE visible -->
      <a-tag
  v-if="typeof state.automatico !== 'undefined'"
  :color="state.automatico === 1 ? 'Green' : 'red'"
   class="font-semibold text-sm"
>
  {{ state.automatico === 1 ? 'Auto' : 'Hand' }}
</a-tag>


    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useDatabaseStore } from '@/stores/database'
  import { message } from 'ant-design-vue'
  
  const props = defineProps({
    fanId: String,
    label: String,
  })
  
  const dbStore = useDatabaseStore()
  const fanVideo = ref(null)
  const videoSrc = '/avanico.mp4'
  
  // Se inicializa con valores por defecto válidos
  const state = ref({
    encendido: 0,
    manual: 0,
    automatico: 1,
  })
  
  const fetchFanState = async () => {
    const fanState = await dbStore.getFanState(props.fanId)
    state.value = fanState
    handleVideoPlayback()
  }
  
  const toggleFan = async (checked) => {

    if (state.value.automatico === 0) {
    message.warning("Este abanico no se puede operar desde la web. Está en modo Hand.");
    return;
  }
    await dbStore.toggleFan(props.fanId, checked)
    await fetchFanState()
  }
  
  const handleVideoPlayback = () => {
    if (fanVideo.value) {
      if (state.value.encendido === 1) {
        fanVideo.value.play()
      } else {
        fanVideo.value.pause()
      }
    }
  }
  
  onMounted(fetchFanState)
  </script>
  