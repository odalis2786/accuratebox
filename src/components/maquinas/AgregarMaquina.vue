<template>
  <a-form
    :model="formState"
    :label-col="{ span: 4 }"
    :wrapper-col="{ span: 14 }"
    @submit.prevent="onSubmit"
    style="padding-bottom: 80px"
  >
    <a-form-item label="Nombre">
      <a-textarea v-model:value="formState.nombre" />
    </a-form-item>
    <a-form-item label="Modelo">
      <a-textarea v-model:value="formState.modelo" />
    </a-form-item>
    <a-form-item label="Ubicacion">
      <a-textarea v-model:value="formState.ubicacion" />
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
          <div style="margin-top: 8px">Agregar Fotos</div>
        </div>
      </a-upload>
    </a-form-item>
    <a-form-item :wrapper-col="{ span: 14, offset: 4 }">
      <a-button
        type="primary"
        @click="onSubmit"
        :disabled="database.loading"
        class="mb-3"
      >
        <template v-if="database.loading">
          <a-spin />
        </template>
        <template v-else> Guardar </template>
      </a-button>
    </a-form-item>
  </a-form>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useDatabaseStore } from "@/stores/database.js"; // Asegúrate de ajustar la ruta de importación según tu estructura de directorios
import { message } from "ant-design-vue";

const database = useDatabaseStore();
const fileList = ref([]);

const formState = reactive({
  nombre: "",
  ubicacion: "",
  modelo: "",
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

const onSubmit = async () => {
  // Extraer los archivos de la lista de archivos de a-upload
  const files = fileList.value.map((file) => file.originFileObj);

  try {
    // Invoca la acción del store para añadir la herramienta y subir las imágenes
    // Nota: Asegúrate de que tu acción en el store acepte los parámetros adecuadamente
    await database.addMaquina({ ...formState }, files, null);

    // Limpieza después de la subida
    Object.keys(formState).forEach((key) => (formState[key] = ""));
    fileList.value = [];
  } catch (error) {
    console.log("Error", error);

    message.error("Error al guardar la herramienta e imágenes.");
  }
};
</script>
