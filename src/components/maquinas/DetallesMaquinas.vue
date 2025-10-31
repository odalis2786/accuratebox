<template>
  <div v-if="maquina">
    <a-button
      type="primary"
      @click="goBack"
      style="
        display: flex;
        align-items: center;
        background-color: black;
        border-color: black;
      "
    >
      <LeftOutlined style="margin-right: 8px" />
      Atras
    </a-button>
    <!-- Carousel de imágenes adaptativo -->
    <a-carousel
      v-if="maquina.imageUrls && maquina.imageUrls.length > 0"
      arrows
      :dots-class="'slick-dots slick-thumb'"
    >
      <template #customPaging="{ i }">
        <a>
          <img :src="maquina.imageUrls[i]" class="thumb-image" />
        </a>
      </template>
      <div v-for="(url, index) in maquina.imageUrls" :key="index">
        <img
          :src="url"
          :alt="`Imagen ${index + 1} del artículo ${maquina.nombre}`"
          class="article-image"
          @click="openModal(url)"
        />
      </div>
    </a-carousel>
    <a-empty v-else description="No hay imágenes disponibles"></a-empty>

    <!-- Descripción de la orden de trabajo -->
    <a-descriptions
      :column="{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }"
      :bordered="true"
      title="Detalles de la Maquina"
    >
      <a-descriptions-item label="Nombre">
        {{ maquina.nombre }}</a-descriptions-item
      >
      <a-descriptions-item label="Modelo">
        {{ maquina.modelo }}</a-descriptions-item
      >
      <a-descriptions-item label="Voltaje">
        {{ maquina.voltaje }}</a-descriptions-item
      >
      <a-descriptions-item label="Ubicacion">
        {{ maquina.ubicacion }}</a-descriptions-item
      >
      <a-descriptions-item label="Comentario">
        {{ maquina.comentario }}</a-descriptions-item
      >
      <a-descriptions-item label="Actions">
        <a-row gutter="16">
          <!-- Adjusted gutter spacing to a single value -->
          <a-col :xs="24" :sm="12" :md="8" :lg="6">
            <a-button class="commentButton" block @click="showAddCommentModal">
              Editar
            </a-button>
          </a-col>

          <a-col :xs="24" :sm="12" :md="8" :lg="6">
            <a-button class="cancelButton" block @click="cancelar">
              Eliminar Maquina
            </a-button>
          </a-col>

          <a-col :xs="24" :sm="12" :md="8" :lg="6">
            <a-button class="historyButton" block @click="cancelar">
              Historial de Reparacion
            </a-button>
          </a-col>

          <a-col :xs="24" :sm="12" :md="8" :lg="6">
            <a-button class="manualButton" block @click="cancelar">
              Ver Manuales
            </a-button>
          </a-col>

          <a-col :xs="24" :sm="12" :md="8" :lg="6">
            <a-button class="addManualButton" block @click="cancelar">
              Agregar Manuales PDF
            </a-button>
          </a-col>
        </a-row>
      </a-descriptions-item>
    </a-descriptions>

    <!-- Modal para mostrar imágenes en grande -->
    <a-modal
      v-model:visible="isImageModalVisible"
      centered
      :style="{ top: '10px', width: '60vw' }"
    >
      <img :src="selectedImageUrl" alt="Imagen en grande" class="modal-image" />
    </a-modal>
  </div>

  <div v-else>
    <p>Selecciona un artículo para ver sus detalles.</p>
    <a-button type="primary" @click="goBack">Back</a-button>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import { useDatabaseStore } from "@/stores/database.js"; // Ajusta la ruta de importación según la ubicación de tu store
import { Modal, Input, message } from "ant-design-vue";
import { LeftOutlined } from "@ant-design/icons-vue";
import { useRouter } from "vue-router";

const database = useDatabaseStore();
const maquina = computed(() => database.MaquinaSeleccionada);
const isImageModalVisible = ref(false);
const selectedImageUrl = ref("");

const router = useRouter();

const goBack = () => {
  router.push({ path: "/home", query: { activeBreadcrumb: "WorkOrderView" } });
};

const openModal = (url) => {
  selectedImageUrl.value = url;
  isImageModalVisible.value = true;
};

const cancelar = () => {};

onMounted(async () => {
  try {
    const idcoment = await database.workorderSeleccionada.id;
    const loadedComments = await database.fetchComments(idcoment);
    await database.initAuthListener();
    comments.value = database.comments;
  } catch (error) {
    console.error("Error loading comments:", error);
  }
});
</script>

<style scoped>
.commentButton,
.cancelButton,
.historyButton,
.manualButton,
.addManualButton {
  margin: 8px; /* Adds margin around each button */
}

.commentButton {
  background-color: #4caf50; /* Green */
  color: white;
  border: none;
}

.cancelButton {
  background-color: #f44336; /* Red */
  color: white;
  border: none;
}

.historyButton {
  background-color: #2196f3; /* Blue */
  color: white;
  border: none;
}

.manualButton {
  background-color: #ff9800; /* Orange */
  color: white;
  border: none;
}

.addManualButton {
  background-color: #9c27b0; /* Purple */
  color: white;
  border: none;
}

/* General button styles */
.a-button {
  font-weight: bold;
  padding: 10px;
  border-radius: 5px;
  transition: background-color 0.3s ease;
}

.a-button:hover {
  opacity: 0.9;
}

.article-image {
  width: 100px; /* Ajusta el ancho deseado */
  height: auto;
  cursor: pointer;
}

.thumb-image {
  width: 60px; /* Ajusta el ancho deseado */
  height: auto;
  cursor: pointer;
}

/* Estilos para las miniaturas */
:deep(.slick-dots) {
  position: relative;
  height: auto;
}
:deep(.slick-slide img) {
  border: 5px solid #fff;
  display: block;
  margin: auto;
  max-width: 80%;
}
:deep(.slick-arrow) {
  display: none !important;
}
:deep(.slick-thumb) {
  bottom: 0px;
}
:deep(.slick-thumb li) {
  width: 60px;
  height: 45px;
}
:deep(.slick-thumb li img) {
  width: 100%;
  height: 100%;
  filter: grayscale(100%);
  display: block;
}

.comment-card {
  width: 100%;
  max-width: 500px;
  margin-bottom: 20px;
}
.comments-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}
:deep .slick-thumb li.slick-active img {
  filter: grayscale(0%);
}

.modal-image {
  max-width: 80%;
  max-height: 80vh;
  display: block;
  margin: auto;
}

.comment-card {
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .comment-card {
    margin-bottom: 15px;
  }
}

@media (min-width: 768px) {
  .comments-container {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-items: flex-start;
  }

  .comment-card {
    width: calc(33.333% - 20px);
    margin-right: 10px;
    margin-left: 10px;
  }
}
@media (min-width: 1024px) {
  .comment-card {
    width: calc(25% - 20px);
  }
}
</style>
