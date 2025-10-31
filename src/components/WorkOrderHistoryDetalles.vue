<template>
  <div v-if="workorder">
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
    <div class="image-row">
      <!-- Carousel para imágenes "Before" -->
      <div
        class="image-column before-thumbnails"
        v-if="workorder.imageUrls && workorder.imageUrls.length > 0"
      >
        <a-typography-title :level="2" type="danger">
          Before
        </a-typography-title>
        <a-carousel arrows :dots-class="'slick-dots slick-thumb'">
          <template #customPaging="{ i }">
            <a>
              <img :src="workorder.imageUrls[i]" class="thumb-image" />
            </a>
          </template>
          <div
            v-for="(url, index) in workorder.imageUrls"
            :key="`before-${index}`"
          >
            <img
              :src="url"
              :alt="`Before Image ${index + 1} of ${workorder.name}`"
              class="article-image"
              @click="showImage(url)"
            />
            <!-- Botón de descarga que invoca una función JS para descargar -->
            <a-button
              type="primary"
              @click="downloadImage(url, `BeforeImage${index + 1}.jpg`)"
            >
              Descargar
            </a-button>
          </div>
        </a-carousel>
      </div>
      <!-- Carousel para imágenes "After" -->
      <div
        class="image-column after-thumbnails"
        v-if="workorder.imgOrderClose && workorder.imgOrderClose.length > 0"
      >
        <a-typography-title :level="2" type="success">
          After
        </a-typography-title>
        <a-carousel arrows :dots-class="'slick-dots slick-thumb'">
          <template #customPaging="{ i }">
            <a>
              <img :src="workorder.imgOrderClose[i]" class="thumb-image" />
            </a>
          </template>
          <div
            v-for="(url, index) in workorder.imgOrderClose"
            :key="`after-${index}`"
          >
            <img
              :src="url"
              :alt="`After Image ${index + 1} of ${workorder.name}`"
              class="article-image"
              @click="showImage(url)"
            />
            <!-- Botón de descarga que invoca una función JS para descargar -->
            <a-button
              type="primary"
              @click="downloadImage(url, `AfterImage${index + 1}.jpg`)"
            >
              Descargar
            </a-button>
          </div>
        </a-carousel>
      </div>
    </div>

    <a-empty
      v-if="
        !(workorder.imageUrls && workorder.imageUrls.length) &&
        !(workorder.imgOrderClose && workorder.imgOrderClose.length)
      "
      description="No hay imágenes disponibles"
    ></a-empty>
  </div>

  <div v-else>
    <p>Selecciona un artículo para ver sus detalles.</p>
    <a-button
      type="primary"
      @click="goBack"
      style="display: flex; align-items: center"
    >
      <LeftOutlined style="margin-right: 8px" />
      Back
    </a-button>
  </div>

  <!-- new descriptions -->
  <a-descriptions
    title="Detalles"
    bordered
    :column="{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }"
    class="mb-3"
  >
    <a-descriptions-item label="W0#">
      <a-tag color="#1890ff">{{ workorder.orderNumber }}</a-tag>
    </a-descriptions-item>
    <a-descriptions-item label="Type of Service">
      <a-tag :color="getTypeColor(workorder.type)">
        <span class="bold-and-large-text">{{ workorder.type }}</span>
      </a-tag>
    </a-descriptions-item>
    <a-descriptions-item label="Priority">
      <a-tag :color="getPriorityColor(workorder.prioriti)">
        {{ workorder.prioriti }}
      </a-tag>
    </a-descriptions-item>
    <a-descriptions-item label="Status">
      <a-tag :color="getPriorityColor(workorder.status)">
        {{ workorder.status }}
      </a-tag>
    </a-descriptions-item>
    <a-descriptions-item label="Comment">{{
      workorder.coment
    }}</a-descriptions-item>
  </a-descriptions>

  <!-- Modal para la imagen ampliada -->
  <a-modal v-model:visible="imageModalVisible" footer="" centered width="80%">
    <img :src="currentImageUrl" alt="Enlarged Image" class="enlarged-image" />
  </a-modal>

  <!-- Modal para la edicion de la fecha -->
  <a-modal
    title="Agregar comentario"
    :visible="isAddCommentModalVisible"
    @ok="handleAddCommentOk()"
    @cancel="handleAddCommentCancel"
  >
    <a-input v-model:value="newComment" placeholder="Escribe un comentario" />
  </a-modal>

  <a-modal v-model:visible="modaldatevisible" title="Editar Fecha">
    <!-- Input para la fecha de creación -->
    <a-space>
      <a-text>Fecha de Creación:</a-text>
      <a-date-picker
        v-model:value="newcreationdate"
        placeholder="Seleccionar fecha"
      ></a-date-picker>
    </a-space>

    <!-- Input para la fecha de cierre -->
    <a-space>
      <a-text>Fecha de Cierre:</a-text>
      <a-date-picker
        v-model:value="newclosedate"
        placeholder="Seleccionar fecha"
      ></a-date-picker>
    </a-space>

    <!-- Botones de acción -->
    <template #footer>
      <a-button key="back" @click="CloseModalDate"> Cancelar </a-button>
      <a-button key="submit" type="primary" @click="handleOk">
        Guardar
      </a-button>
    </template>
  </a-modal>
  <!-- Tarjetas de comentarios responsivas -->
  <div v-if="formattedComments.length > 0" class="comments-container">
    <a-card
      v-for="(item, index) in formattedComments"
      :key="index"
      size="small"
      class="comment-card"
      :style="{ width: '100%', maxWidth: '500px', margin: '0 auto 20px' }"
    >
      <template #title>
        <a-row justify="space-between" align="middle">
          <a-col>
            <a-space align="center">
              <a-avatar :src="item.userphotoURL" size="small" />
              <span>{{ item.name ? item.name : "Usuario Desconocido" }}</span>
            </a-space>
          </a-col>
          <a-col>
            <a-button
              :disabled="database.currentUser.email !== item.email"
              danger
              size="small"
              @click="deleteComment(item.id)"
              >Eliminar</a-button
            >
          </a-col>
        </a-row>
      </template>
      <p>{{ item.text }}</p>
      <div class="comment-metadata">
        <span>{{ item.formattedDate }}</span>
      </div>
    </a-card>
  </div>
  <p v-else>No comments available.</p>

  <a-button type="primary" @click="OpenmodalEditDate">Editar Fecha</a-button>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import { useDatabaseStore } from "@/stores/database.js"; // Ajusta la ruta de importación según la ubicación de tu store
import { Modal, Input, message } from "ant-design-vue";
import { useRouter } from "vue-router";
import { LeftOutlined } from "@ant-design/icons-vue";

const imageModalVisible = ref(false);
const currentImageUrl = ref("");
const modaldatevisible = ref(false);
const newcreationdate = ref(null);
const newclosedate = ref(null);
const comments = ref([]);

// Función para mostrar el modal con la imagen
function showImage(url) {
  currentImageUrl.value = url;
  imageModalVisible.value = true;
}

const router = useRouter();
const database = useDatabaseStore();
const workorder = computed(() => database.workorderSeleccionada);

// Estado para controlar la visibilidad del modal y el comentario
const isModalVisible = ref(false);
const comentario = ref("");

// Modal edicion de fecha
const OpenmodalEditDate = () => {
  modaldatevisible.value = true;
};
const formattedComments = computed(() => {
  return comments.value.map((comment) => ({
    ...comment,
    formattedDate: formatDate(comment.date),
  }));
});
const CloseModalDate = () => {
  modaldatevisible.value = false;
  newclosedate.value = "";
  newcreationdate.value = "";
};

const handleOk = async () => {
  await database.updateWorkOrderClose(
    database.workorderSeleccionada.id,
    newclosedate.value,
    newcreationdate.value
  );

  modaldatevisible.value = false;
};

const goBack = () => {
  router.push({ path: "/home", query: { activeBreadcrumb: "WorkOrderView" } });
};

const showModalPendiente = () => {
  isModalVisible.value = true;
  comentario.value = ""; // Resetear el comentario cada vez que abres el modal
};

const handleOkPendiente = async () => {
  console.log("Comentario", comentario.value);

  if (!comentario.value.trim()) {
    message.error("Por favor, ingresa un comentario.");
    // No cerrar el modal si no hay comentario
    return Promise.reject(); // Evita cerrar el modal automáticamente
  } else {
    // Proceder con la lógica de actualización
    try {
      await database.updateWorkOrderStatus1(
        workorder.value.id,
        "Pendiente",
        comentario.value
      );
      message.success(
        "Orden de trabajo actualizada correctamente a 'Pendiente'."
      );
      comentario.value = ""; // Limpia el comentario después de actualizar
      isModalVisible.value = false; // Cierra el modal después de la actualización
    } catch (error) {
      message.error("Error al actualizar el estado de la orden de trabajo.");
      console.error(error);
      return Promise.reject(); // Evita cerrar el modal en caso de error
    }
  }
};

const handleCancelPendiente = () => {
  isModalVisible.value = false;
};

const cancelar = (record) => {
  Modal.confirm({
    title: "Confirmar eliminación",
    content: "¿Estás seguro de que quieres borrar esta orden de trabajo?",
    okText: "Sí, borrar",
    okType: "danger",
    cancelText: "Cancelar",
    onOk() {
      database
        .deleteWorkOrder(record.id)
        .then(() => {
          console.log("Orden de trabajo eliminada:", record.id);
          // Aquí puedes agregar lógica adicional si necesitas, por ejemplo, actualizar la vista.
        })
        .catch((error) => {
          console.error("Error al eliminar la orden de trabajo:", error);
        });
    },
    onCancel() {
      console.log("Operación cancelada");
    },
  });
};

const pendiente = (record) => {
  console.log("Pendiente", record);
  // Aquí tu lógica para marcar la orden de trabajo como "Pendiente"
};

const cerrar = (record) => {
  Modal.confirm({
    title: "Confirmación",
    content: "¿Estás seguro de que deseas cerrar esta orden de trabajo?",
    okText: "Sí",
    cancelText: "No",
    onOk() {
      // Aquí manejas la confirmación positiva
      router.push({ name: "CerrarOrden", params: { workOrderId: record.id } }); // Asume que tienes una ruta nombrada 'CerrarOrden'
    },
    onCancel() {
      console.log("Operación cancelada");
    },
  });
};

// Descargar imagen
async function downloadImage(url, filename) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Network response was not ok.");
    const blob = await response.blob(); // Create a blob from the response data
    const downloadUrl = window.URL.createObjectURL(blob); // Create a URL from the blob
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename; // Set the download filename
    document.body.appendChild(link);
    link.click(); // Trigger the download
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl); // Clean up the URL object
  } catch (error) {
    console.error("Failed to download image:", error);
  }
}

// Función para obtener el color de la prioridad
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
.enlarged-image {
  width: 100%;
  height: auto;
}
/* Estilo general para los comentarios en la tabla */
.comment-cell {
  max-width: 250px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Estilos para las imágenes en el carrousel */
.article-image,
.thumb-image {
  width: 100%;
  height: auto;
  margin: auto;
  max-width: 100%;
}

/* Estilos específicos para los elementos del carrousel (slick) */
:deep(.slick-dots) {
  position: absolute;
  bottom: -45px;
  width: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
  text-align: center;
}
:deep(.slick-slide img) {
  border: none;
  display: block;
  margin: auto;
  max-width: 100%;
  max-height: 250px; /* Controla el tamaño máximo de las imágenes en el carrousel */
}
:deep(.slick-arrow) {
  display: none; /* Oculta las flechas de navegación */
}
:deep(.slick-thumb li) {
  width: 80px; /* Tamaño de las miniaturas */
  height: 60px;
  margin: 0 5px; /* Espaciado entre miniaturas */
  display: inline-block;
}
:deep(.slick-thumb li img) {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Asegura que las imágenes cubran el área designada sin distorsión */
}

/* Estilos para botones con colores específicos para cada acción */
.onItButton {
  color: #faad14;
}
.pendingButton {
  color: #1890ff;
}
.closedButton {
  color: #52c41a;
}
.cancelButton {
  color: #ff4d4f;
}

/* Flexbox para alinear imágenes "Before" y "After" */
.image-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: flex-start;
}
.image-column {
  flex: 1 1 50%; /* Cada columna toma hasta el 50% del espacio disponible */
  max-width: 500px; /* Máximo ancho para las columnas */
  margin: 10px;
}
.after-thumbnails :deep(.slick-dots) {
  position: relative;
  left: 500px;
}
.before-thumbnails :deep(.slick-dots) {
  position: relative;
  left: 550px;
}

@media (max-width: 768px) {
  .image-row {
    flex-direction: column;
  }
  .image-column {
    width: 100%; /* Las columnas toman todo el ancho disponible en pantallas pequeñas */
    margin-bottom: 20px;
  }
  :deep(.slick-dots) {
    bottom: -25px; /* Ajuste para miniaturas en pantallas pequeñas */
  }
}
.article-image + .ant-btn {
  display: block;
  margin-top: 10px;
  width: auto; /* Ajustar según sea necesario */
  text-align: center; /* Centrar el botón debajo de la imagen */
}
</style>
