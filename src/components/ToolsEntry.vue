<template>
  <a-form
    :model="formState"
    :label-col="{ span: 4 }"
    :wrapper-col="{ span: 14 }"
    @submit.prevent="onSubmit"
  >
    <a-form-item label="Nombre">
      <a-input v-model:value="formState.name" />
    </a-form-item>
    <a-form-item label="Ubicación">
      <a-input v-model:value="formState.location" />
    </a-form-item>
    <a-form-item label="Modelo">
      <a-input v-model:value="formState.model" />
    </a-form-item>
    <a-form-item label="Descripción">
      <a-textarea v-model:value="formState.desc" />
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
      <a-button type="primary" @click="onSubmit"
        >Guardar Herramienta e Imágenes</a-button
      >
    </a-form-item>
  </a-form>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useUserStore } from "../stores/user.js"; // Asegúrate de ajustar la ruta de importación según tu estructura de directorios
import { message } from "ant-design-vue";

const userStore = useUserStore();
const fileList = ref([]);

const formState = reactive({
  name: "",
  location: "",
  model: "",
  desc: "",
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
    await userStore.addTool({ ...formState }, files);

    // Limpieza después de la subida
    Object.keys(formState).forEach((key) => (formState[key] = ""));
    fileList.value = [];
  } catch (error) {
    console.log("Error", error);

    message.error("Error al guardar la herramienta e imágenes.");
  }
};
</script>
