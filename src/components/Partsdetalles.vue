<template>
  <div v-if="articulo">
    <h2>Detalles de la Parte</h2>

    <!-- Tabla con los detalles -->
    <a-table :dataSource="[articulo]" :pagination="false" class="details-table" rowKey="id">
      <a-table-column title="ID" dataIndex="id" key="id" />
      <a-table-column title="Nombre" dataIndex="name" key="name" />
      <a-table-column title="Ubicación" dataIndex="location" key="location" />
      <a-table-column title="Descripción" dataIndex="desc" key="desc" />
      <a-table-column title="Máquina" dataIndex="machine" key="machine" />
      <a-table-column title="Cantidad" dataIndex="model" key="model" />
    </a-table>

    <!-- Botones para sumar y restar -->
    <div class="button-group">
      <a-button
        type="default"
        size="large"
        @click="showModal"
        :disabled="articulo.model <= 0"
      >
        Restar
      </a-button>
      <a-button type="primary" size="large" @click="showModal">
        Sumar
      </a-button>
    </div>

    <a-button type="primary" @click="goBack" style="margin-top: 20px">
      Volver
    </a-button>
  </div>

 













  <div v-else>
    <p>No se ha seleccionado ninguna parte. Por favor, selecciona una parte desde la lista.</p>
    <a-button type="primary" @click="goBack">Volver</a-button>
  </div>
  <a-modal
      title="Please add a Input"
      :visible="isModalVisible"
      @ok="handleOkPendiente"
      @cancel="handleCancelPendiente"
    >
      <a-input
        v-model:value="comentario"
        placeholder="¿Por qué está pendiente?"
      />
    </a-modal>
</template>

<script setup>
import { computed ,ref} from "vue";
import { useUserStore } from "@/stores/user.js";
import { useRouter } from "vue-router";
import { Modal, Input, message } from "ant-design-vue";
const toolsStore = useUserStore();
const router = useRouter();
const isModalVisible = ref(false);
// Recupera la parte seleccionada desde el store
const articulo = computed(() => toolsStore.PartsSeleccionado);

// Redirige al usuario a la vista anterior
const goBack = () => {
  router.go(-1);
};


const showModal = () => {
  isModalVisible.value = true;
  comentario.value = ""; // Resetear el comentario cada vez que abres el modal
};

const handleCancelPendiente = () => {
  isModalVisible.value = false;
};











// Llama al método del store para actualizar el campo `model`
const updateQuantity = async (delta) => {
  await toolsStore.updatePartModel(articulo.value.id, delta);
};
</script>

<style scoped>
.details-table {
  margin-top: 20px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  overflow: hidden;
}

.details-table .ant-table {
  border-radius: 8px;
  overflow: hidden;
}

/* Grupo de botones */
.button-group {
  display: flex;
  justify-content: center;
  gap: 20px; /* Espaciado entre los botones */
  margin-top: 20px; /* Espaciado desde la tabla */
}

a-button {
  min-width: 120px; /* Asegura un tamaño consistente de botones */
}
</style>
