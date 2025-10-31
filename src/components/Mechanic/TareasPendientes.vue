<template>
  <div v-if="tareas.length > 0">
    <div v-for="record in tareas" :key="record.id" class="workorder-container">
      <a-descriptions
        :column="{ xxl: 4, xl: 3, lg: 3, md: 2, sm: 2, xs: 1 }"
        :bordered="true"
      >
        <template #title>
          <div class="title-container">
            <span>Tarea #{{ record.orderNumber }}</span>
            <a-button
              type="primary"
              @click="viewDetails(record)"
              class="details-button"
            >
              Ver Detalles
            </a-button>
          </div>
        </template>
        <a-descriptions-item label="IMG">
          <a-avatar
            v-if="record.imageUrls && record.imageUrls.length"
            :src="record.imageUrls[0]"
          />
          <a-avatar v-else>
            <UserOutlined />
          </a-avatar>
        </a-descriptions-item>
        <a-descriptions-item label="Creation Date">
          {{ formatDate(record.timestamp) }}
        </a-descriptions-item>

        <a-descriptions-item label="Created By">
          <a-tag :color="getPriorityColor(record.type)">
            {{ record.creador }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="Comentario">
          {{ record.comentario }}
        </a-descriptions-item>
        <a-descriptions-item label="Status">
          {{ record.Status || "Sin atender" }}
        </a-descriptions-item>
      </a-descriptions>
    </div>
  </div>
  <div v-else>
    <p>No hay órdenes de trabajo disponibles.</p>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import { useDatabaseStore } from "../../stores/database.js";
import { UserOutlined } from "@ant-design/icons-vue";
import { useRouter } from "vue-router";
import { format } from "date-fns";
const tareas = ref([]); // Variable reactiva para almacenar las tareas
const database = useDatabaseStore();
const router = useRouter();

const getPriorityColor = (prioriti) => {
  const priorityNumber = Number(prioriti);

  switch (priorityNumber) {
    case 1:
      return "#C12E2A"; // Rojo intenso
    case 2:
      return "#E96125"; // Naranja rojizo oscuro
    case 3:
      return "#FF8C00"; // Naranja oscuro
    case 4:
      return "#008B8B"; // Cian oscuro
    case 5:
      return "#008000"; // Verde oscuro
    default:
      return "default";
  }
};

const getTypeColor = (type) => {
  switch (type) {
    case "External":
      return "#ffc8aa"; // Rojo intenso
    case "Internal":
      return "#bfe1f6"; // Naranja rojizo oscuro
  }
};

const viewDetails = (tareas) => {
  database.seleccionarWorkOrder(tareas);

  router.push({
    name: "workorderdetalles",
    query: { from: "workview" }, // Indica desde dónde se está navegando
  });
};

const formatDate = (timestamp) => {
  if (!timestamp) return "";
  const date = timestamp.toDate();
  return format(date, "MMMM do, yyyy 'at' HH:mm");
};

onMounted(() => {
  console.log("On mounted llamado desde tareas pendientes");

  database.fetchTareas();
  console.log("Tareas:", database.tareas);
});

watch(
  () => database.tareas,
  (newTareas) => {
    console.log("Tareas actualizadas:", newTareas);
    tareas.value = newTareas;
  },
  { immediate: true }
);
</script>

<style scoped>
.title-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 8px;
}
.details-button {
  margin-top: 8px;
}

@media (min-width: 576px) {
  .title-container {
    flex-direction: row;
    align-items: center;
  }
  .details-button {
    margin-top: 0;
    margin-left: 8px;
  }
}
</style>
