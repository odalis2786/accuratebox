<template>
  <div v-if="articulo">
    <h2>Detalles del Artículo</h2>
    <a-carousel arrows dots-class="slick-dots slick-thumb">
      <template #customPaging="{ i }">
        <a>
          <img :src="articulo.imageUrls[i]" class="thumb-image" />
        </a>
      </template>
      <div v-for="(url, index) in articulo.imageUrls" :key="index">
        <img
          :src="url"
          :alt="`Imagen ${index + 1} del artículo ${articulo.name}`"
          class="article-image"
        />
      </div>
    </a-carousel>
    <a-table :dataSource="[articulo]" :pagination="false">
      <a-table-column title="Nombre" dataIndex="name" key="name" />
      <a-table-column title="Ubicación" dataIndex="location" key="location" />
      <a-table-column title="Coment" dataIndex="desc" key="desc" />
      <!-- Agrega aquí más columnas según los datos de tu artículo -->
    </a-table>
    <a-button type="primary" @click="goBack">Back</a-button>
  </div>
  <div v-else>
    <p>Selecciona un artículo para ver sus detalles.</p>
    <a-button type="primary" @click="goBack">Back</a-button>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useUserStore } from "@/stores/user.js"; // Ajusta la ruta de importación según la ubicación de tu store
import { useRouter } from "vue-router";

const router = useRouter();
const userStore = useUserStore();
const articulo = computed(() => userStore.articuloSeleccionado);
const goBack = () => {
  router.push({ path: "/home", query: { activeBreadcrumb: "WorkOrderView" } });
};
</script>

<style scoped>
.article-image,
.thumb-image {
  width: 50%;
  max-width: 80%; /* Ajusta este valor según necesites */
  margin: auto; /* Centra la imagen */
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
:deep .slick-thumb li.slick-active img {
  filter: grayscale(0%);
}
</style>
