<template>
  <div>
    <div v-if="paginatedMaquinas.length > 0" class="workorders-container">
      <a-pagination
        :current="currentPage"
        :total="totalOrders"
        :pageSize="pageSize"
        @change="handlePageChange"
        :class="{ 'hide-pagination': hidePagination }"
        class="pagination"
      />
      <div
        v-for="record in paginatedMaquinas"
        :key="record.id"
        class="workorder-container"
      >
        <a-descriptions
          :column="{ xxl: 4, xl: 3, lg: 3, md: 2, sm: 2, xs: 1 }"
          :bordered="true"
        >
          <template #title>
            <div class="title-container">
              <span>{{ record.nombre }}</span>
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

          <a-descriptions-item label="Nombre">
            <a-tag>{{ record.nombre }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="Ubicacion">
            <a-tag>{{ record.ubicacion }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="Modelo">
            <a-tag>{{ record.modelos }}</a-tag>
          </a-descriptions-item>
        </a-descriptions>
      </div>
    </div>
    <div v-else>
      <p>No hay maquina disponibles.</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, computed, ref } from "vue";
import { useDatabaseStore } from "@/stores/database.js";
import { UserOutlined } from "@ant-design/icons-vue";
import { useRouter } from "vue-router";
import { format } from "date-fns";

// Lógica para mostrar/ocultar la paginación en pantallas pequeñas
const hidePagination = ref(false);
let lastScrollY = 0;

const handleScroll = () => {
  if (window.scrollY > lastScrollY && window.scrollY > 100) {
    hidePagination.value = true;
  } else {
    hidePagination.value = false;
  }
  lastScrollY = window.scrollY;
};

const database = useDatabaseStore();
const router = useRouter();

const isMobile = ref(window.innerWidth <= 576);

const handleResize = () => {
  isMobile.value = window.innerWidth <= 576;
};

window.addEventListener("resize", handleResize);

const viewDetails = (maquina) => {
  console.log("desde ver detalles:", maquina);

  database.seleccionarMaquina(maquina);

  router.push({
    name: "detallesmaquina",
    query: { from: "detallesmaquina" }, // Indica desde dónde se está navegando
  });
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
  database.fetchMaquinas();
});
onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
const maquina = computed(() => database.maquinas);

// Paginación
const currentPage = ref(1);
const pageSize = ref(5);
const totalOrders = computed(() => maquina.value.length);

const paginatedMaquinas = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return maquina.value.slice(start, end);
});

const handlePageChange = (page) => {
  currentPage.value = page;
};
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

.pagination {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background: #fff;
  padding: 10px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000; /* Asegura que la paginación esté por encima de otros elementos */
}

.workorders-container {
  padding-top: 60px; /* Asegura que el contenido no quede oculto detrás de la paginación */
  padding-left: 16px; /* Márgenes en los lados izquierdo y derecho */
  padding-right: 16px;
  box-sizing: border-box; /* Asegura que el padding no aumente el tamaño total del contenedor */
}

.workorder-table {
  margin-bottom: 16px; /* Espacio entre las tablas de órdenes de trabajo */
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

.floating-menu {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background: #fff;
  display: flex;
  justify-content: space-around;
  padding: 10px 0;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000; /* Asegura que el menú esté por encima de otros elementos */
}

.submenu {
  position: fixed;
  bottom: 50px;
  left: 0;
  width: 100%;
  background: #fff;
  display: flex;
  justify-content: space-around;
  padding: 10px 0;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000; /* Asegura que el submenú esté por encima de otros elementos */
}
</style>
