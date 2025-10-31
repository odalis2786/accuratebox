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
    <!-- Carousel de imágenes adaptativo -->
    <a-carousel
      v-if="workorder.imageUrls.length > 0"
      arrows
      :dots-class="'slick-dots slick-thumb'"
    >
      <template #customPaging="{ i }">
        <a>
          <img :src="workorder.imageUrls[i]" class="thumb-image" />
        </a>
      </template>
      <div v-for="(url, index) in workorder.imageUrls" :key="index">
        <img
          :src="url"
          :alt="`Imagen ${index + 1} del artículo ${workorder.name}`"
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
      title="Detalles de la Orden de Trabajo"
    >
      <a-descriptions-item label="W0 #">
        <a-tag color="#1890ff">{{
          workorder.orderNumber
        }}</a-tag></a-descriptions-item
      >
      <a-descriptions-item label="Type of Service">
        <a-tag :color="getTypeColor(workorder.type)">
          {{ workorder.type }}
        </a-tag>
      </a-descriptions-item>
      <a-descriptions-item label="Priority">
        <a-tag :color="getPriorityColor(workorder.prioriti)">
          {{ workorder.prioriti }}
        </a-tag>
      </a-descriptions-item>
      <a-descriptions-item label="Status">
        <a-tag :color="getPriorityColor(workorder.status)">
          {{ workorder.Status }}
        </a-tag>
      </a-descriptions-item>
      <a-descriptions-item label="Actions">
        <a-row gutter="[8, 8]">
          <a-col :xs="24" :sm="12" :md="8" :lg="6">
            <a-button class="commentButton" block @click="showAddCommentModal">
              Comentarios
            </a-button>
          </a-col>
          <a-col :xs="24" :sm="12" :md="8" :lg="6">
            <a-button class="onItButton" block @click="onIt">On it</a-button>
          </a-col>
          <a-col :xs="24" :sm="12" :md="8" :lg="6">
            <a-button class="pendingButton" block @click="showModalPendiente">
              Pending
            </a-button>
          </a-col>
          <a-col :xs="24" :sm="12" :md="8" :lg="6">
            <a-button class="closedButton" block @click="cerrar"
              >Closed</a-button
            >
          </a-col>
          <a-col :xs="24" :sm="12" :md="8" :lg="6">
            <a-button class="cancelButton" block @click="cancelar"
              >Eliminar Orden</a-button
            >
          </a-col>
        </a-row>
      </a-descriptions-item>
    </a-descriptions>

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

    <!-- Modal para mostrar imágenes en grande -->
    <a-modal
      v-model:visible="isImageModalVisible"
      centered
      :style="{ top: '10px', width: '60vw' }"
    >
      <img :src="selectedImageUrl" alt="Imagen en grande" class="modal-image" />
    </a-modal>

    <!-- Modal para agregar comentarios -->
    <a-modal
      title="Agregar comentario"
      :visible="isAddCommentModalVisible"
      @ok="handleAddCommentOk"
      @cancel="handleAddCommentCancel"
    >
      <a-input v-model:value="newComment" placeholder="Escribe un comentario" />
    </a-modal>

    <!-- Modal para marcar como pendiente -->
    <a-modal
      title="Marcar como pendiente"
      :visible="isModalVisible"
      @ok="handleOkPendiente"
      @cancel="handleCancelPendiente"
    >
      <a-input
        v-model:value="comentario"
        placeholder="¿Por qué está pendiente?"
      />
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
import { format, parseISO } from "date-fns";
import { LeftOutlined } from "@ant-design/icons-vue";
import { useRouter } from "vue-router";

const comments = ref([]);
const router = useRouter();
const currentRecord = ref(null); // Almacenará el 'record' cuando se abra el modal

const isAddCommentModalVisible = ref(false);
const newComment = ref("");

const showAddCommentModal = () => {
  isAddCommentModalVisible.value = true;
  newComment.value = ""; // Resetear el comentario cada vez que se abre el modal
};

const handleAddCommentOk = async () => {
  // Verifica que el comentario no esté vacío o solo contenga espacios en blanco
  if (!newComment.value.trim()) {
    message.error("El comentario no puede estar vacío.");
    return;
  }

  try {
    const newCommentEntry = {
      text: newComment.value,
      date: new Date().toISOString(), // Captura la fecha y hora actual
    };

    await database.addCommentToWorkOrder(
      database.workorderSeleccionada.id,
      newCommentEntry
    );
    const idcoment = await database.workorderSeleccionada.id;
    const loadedComments = await database.fetchComments(idcoment);

    comments.value = database.comments;

    newComment.value = "";
    isAddCommentModalVisible.value = false;
    message.success("Comentario añadido correctamente.");
  } catch (error) {
    message.error("Error al añadir el comentario.");
    console.error(error);
    return Promise.reject();
  }
};

const handleAddCommentCancel = () => {
  isAddCommentModalVisible.value = false;
};

const database = useDatabaseStore();
const isModalVisible = ref(false);
const comentario = ref("");

const isImageModalVisible = ref(false);
const selectedImageUrl = ref("");

const workorder = computed(() => database.workorderSeleccionada);

const goBack = () => {
  router.push({ path: "/home", query: { activeBreadcrumb: "WorkOrderView" } });
};

const onIt = () => {
  Modal.confirm({
    title: "Confirmación",
    content:
      '¿Estás seguro de que quieres marcar esta orden de trabajo como "En Proceso"?',
    okText: "Sí",
    okType: "danger",
    cancelText: "No",
    onOk() {
      database.updateWorkOrderStatus(workorder.value.id, "On It");
    },
    onCancel() {
      console.log("Cancelado");
    },
  });
};

const showModalPendiente = () => {
  isModalVisible.value = true;
  comentario.value = ""; // Resetear el comentario cada vez que abres el modal
};

const handleOkPendiente = async () => {
  if (!comentario.value.trim()) {
    message.error("Por favor, ingresa un comentario.");
    return Promise.reject(); // Evita cerrar el modal automáticamente
  } else {
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

const cancelar = () => {
  Modal.confirm({
    title: "Confirmar eliminación",
    content: "¿Estás seguro de que quieres borrar esta orden de trabajo?",
    okText: "Sí, borrar",
    okType: "danger",
    cancelText: "Cancelar",
    onOk() {
      database
        .deleteWorkOrder(workorder.value.id)
        .then(() => {
          goBack();
          console.log("Orden de trabajo eliminada:", workorder.value.id);
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

const cerrar = () => {
  Modal.confirm({
    title: "Confirmación",
    content: "¿Estás seguro de que deseas cerrar esta orden de trabajo?",
    okText: "Sí",
    cancelText: "No",
    onOk() {
      router.push({
        name: "CerrarOrden",
        params: { workOrderId: workorder.value.id },
      });
    },
    onCancel() {
      console.log("Operación cancelada");
    },
  });
};

const openModal = (url) => {
  selectedImageUrl.value = url;
  isImageModalVisible.value = true;
};

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

function formatDate(timestamp) {
  if (!timestamp) {
    return "Fecha no disponible";
  }

  let date;
  if (timestamp.toDate) {
    date = timestamp.toDate();
  } else if (typeof timestamp === "string") {
    try {
      date = parseISO(timestamp);
    } catch (error) {
      console.error("Error al parsear la fecha ISO:", error);
      return "Fecha no válida";
    }
  } else if (timestamp.seconds) {
    date = new Date(timestamp.seconds * 1000);
  } else {
    return "Formato de fecha no reconocido";
  }

  try {
    return format(date, "dd/MM/yyyy 'a las' HH:mm:ss");
  } catch (error) {
    console.error("Error al formatear la fecha:", error);
    return "Formato de fecha inválido";
  }
}

const deleteComment = async (commentId) => {
  Modal.confirm({
    title: "Confirmar eliminación",
    content: "¿Estás seguro de que quieres borrar este comentario?",
    okText: "Sí, borrar",
    okType: "danger",
    cancelText: "Cancelar",
    onOk() {
      database
        .deleteComment(commentId, database.workorderSeleccionada.id)
        .then(() => {
          const index = comments.value.findIndex((c) => c.id === commentId);
          if (index !== -1) {
            comments.value.splice(index, 1);
          }
          message.success("Comentario eliminado correctamente.");
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

const formattedComments = computed(() => {
  return comments.value.map((comment) => ({
    ...comment,
    formattedDate: formatDate(comment.date),
  }));
});

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

/* Estilos para botones */
.onItButton {
  color: #faad14; /* Amarillo oscuro para "On It" */
}

.pendingButton {
  color: #1890ff; /* Azul para "Pending" */
}

.closedButton {
  color: #52c41a; /* Verde para "Closed" */
}

.cancelButton {
  color: #ff4d4f; /* Rojo para "Cancel", aunque `danger` ya aplica un estilo similar */
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
