<template>
  <a-button type="primary" @click="router.push('adduser')" class="mb-3"
    >Agregar Usuario</a-button
  >

  <a-table :columns="columns" :dataSource="users" rowKey="id">
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
import { useUserStore } from "../stores/user.js"; // Asegúrate de que esta ruta es correcta
import { UserOutlined } from "@ant-design/icons-vue";
import { useRouter } from "vue-router";

const userStore = useUserStore();
const router = useRouter();

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
    title: "Nombre",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Ubicación",
    dataIndex: "location",
    key: "location",
  },
  {
    title: "Acciones",
    key: "actions",
  },
];

const viewDetails = (user) => {
  userStore.selectUser(user); // Asumiendo que tienes una acción para seleccionar un usuario
  console.log("Ver detalles de:", user);
  router.push({ name: "userDetails", params: { userId: user.id } }); // Asegúrate de que la ruta y el parámetro son correctos
};

onMounted(() => {
  userStore.fetchUsers(); // Asegúrate de tener esta acción en tu store
});

const users = computed(() => userStore.users); // Asumiendo que `users` es tu estado reactivo que contiene los usuarios
</script>
