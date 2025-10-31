<template>
    <div>
      <h2>Detalles de la Parte</h2>
      <a-card v-if="selectedPart">
        <p><strong>ID:</strong> {{ selectedPart.id }}</p>
        <p><strong>Nombre:</strong> {{ selectedPart.name }}</p>
        <p><strong>Ubicación:</strong> {{ selectedPart.location }}</p>
        <p>
          <strong>Avatar:</strong>
          <a-avatar
            v-if="selectedPart.imageUrls && selectedPart.imageUrls.length"
            :src="selectedPart.imageUrls[0]"
          />
          <a-avatar v-else>
            <UserOutlined />
          </a-avatar>
        </p>
      </a-card>
      <a-button type="primary" @click="goBack">Volver</a-button>
    </div>
  </template>
  
  <script setup>
  import { computed } from "vue";
  import { useUserStore } from "../stores/user.js"; // Ajusta esta ruta
  import { UserOutlined } from "@ant-design/icons-vue";
  import { useRouter } from "vue-router";
  
  const toolsStore = useUserStore();
  const router = useRouter();
  
  const selectedPart = computed(() => toolsStore.selectedParts);
  
  const goBack = () => {
    router.push({ name: "partslist" });
  };
  </script>
  