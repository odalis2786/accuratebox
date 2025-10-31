<template>
  <h5>
    Por favor exprese todos los trabajos realizados asi como las partes y suba
    foto si es nesesario
  </h5>
  <a-form
    :model="formState"
    :label-col="{ span: 4 }"
    :wrapper-col="{ span: 14 }"
    @submit.prevent="onSubmit"
  >
    <a-form-item label="Work Keys">
      <a-textarea v-model:value="formState.coment" />
    </a-form-item>

    <a-form-item label="Imágenes">
      <a-upload
        list-type="picture-card"
        multiple
        :before-upload="beforeUpload"
        :file-list="fileList"
        @change="handleChange"
      >
        <div>
          <div style="margin-top: 8px">Subir</div>
        </div>
      </a-upload>
    </a-form-item>
    <a-form-item :wrapper-col="{ span: 14, offset: 4 }">
      <a-space>
        <a-button type="primary" @click="goBack">Back</a-button>
        <a-button type="primary" @click="onSubmit">Save</a-button></a-space
      >
    </a-form-item>
  </a-form>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useDatabaseStore } from "../stores/database.js"; // Asegúrate de ajustar la ruta de importación según tu estructura de directorios
import { message } from "ant-design-vue";

import { useRouter } from "vue-router";
import { useRoute } from "vue-router";
const route = useRoute();
const workOrderId = route.params.workOrderId;
const router = useRouter();

const database = useDatabaseStore();
const fileList = ref([]);

const formState = reactive({
  coment: "",
  Status: "Closed",
});

// Esta función se llama antes de cada subida de archivo
const beforeUpload = (file) => {
  // Aquí puedes agregar validaciones de archivos si es necesario
  return false; // Detiene la subida automática
};

// Maneja los cambios en la lista de archivos, incluyendo adiciones y eliminaciones
const handleChange = ({ fileList: newFileList }) => {
  fileList.value = newFileList;
};
const goBack = () => {
  router.push({ path: "/home", query: { activeBreadcrumb: "WorkOrderView" } });
};

const onSubmit = async () => {
  if (!formState.coment) {
    message.error("Por favor, completa todos los campos requeridos.");
    return;
  }

  // Asegúrate de incluir el workOrderId en los datos que pasas
  formState.workOrderId = workOrderId;

  // Llamar a la acción del store
  await database.addWorkOrderClosed(
    formState,
    fileList.value.map((file) => file.originFileObj)
  );
  goBack();
  // Limpieza o redirección después de cerrar la orden
};
</script>
