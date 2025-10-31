<template>
  <a-table :columns="columns" :dataSource="tools" rowKey="id">
    <!-- No es necesario definir slots aquí como antes -->
    <template v-slot:bodyCell="{ column, record }">
      <template v-if="column.key === 'avatar'">
        <a-space>
          <a-avatar
            v-if="record.imageUrls && record.imageUrls.length"
            :src="record.imageUrls[0]"
          />
          <a-avatar v-else>
            <UserOutlined />
          </a-avatar>
        </a-space>
      </template>
      <template v-if="column.key === 'actions'">
        <a-button type="primary" @click="viewDetails(record)"
          >Ver Detalles</a-button
        >
      </template>
    </template>
  </a-table>
</template>

<script setup>
import { onMounted, computed } from "vue";
import { useUserStore } from "../stores/user.js"; // Ajusta esta ruta a tu configuración
import { UserOutlined } from "@ant-design/icons-vue";
import { useRouter } from "vue-router"; // Importa useRouter
const toolsStore = useUserStore();
const router = useRouter(); // Usa useRouter
const columns = [
  {
    title: "Avatar",
    dataIndex: "avatar",
    key: "avatar",
  },
  {
    title: "ID",
    dataIndex: "id",
    key: "id",
  },
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Location",
    dataIndex: "location",
    key: "location",
  },
  {
    title: "Acciones",
    key: "actions",
    // Ya no necesitas definir slots aquí
  },
];

const viewDetails = (articulo) => {
  toolsStore.seleccionarArticulo(articulo);
  console.log("Ver detalles de:", articulo);
  router.push({ name: "Detalles" });
};

onMounted(() => {
  toolsStore.fetchTools();
});

const tools = computed(() => toolsStore.tools);
</script>
