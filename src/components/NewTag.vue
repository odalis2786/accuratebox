<template>
  <a-form
    :model="formState"
    :label-col="{ span: 4 }"
    :wrapper-col="{ span: 14 }"
    @submit.prevent="onSubmit"
  >
    <a-form-item label="Name">
      <a-input v-model:value="formState.name" />
    </a-form-item>
    <a-form-item label="Id:">
      <a-input v-model:value="formState.id" />
    </a-form-item>

    <a-form-item :wrapper-col="{ span: 14, offset: 4 }">
      <a-button type="primary" @click="onSubmit">Save</a-button>
    </a-form-item>
  </a-form>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useUserStore } from "../stores/user.js"; // Asegúrate de ajustar la ruta de importación según tu estructura de directorios
import { message } from "ant-design-vue";
import { useDatabaseStore } from "../stores/database";
const database = useDatabaseStore();

const userStore = useUserStore();
const fileList = ref([]);

const formState = reactive({
  name: "",
  id: "",
});

const onSubmit = () => {};

// Esta función se llama antes de cada subida de archivo
const beforeUpload = (file) => {
  // Aquí puedes agregar validaciones de archivos si es necesario
  return false; // Detiene la subida automática
};

const saveToDatabase = async () => {
  try {
    // Llama a la función de tu store de Pinia para guardar los datos en Firebase
    await database.saveTag(formState.name, formState.id);
    message.success("Data saved successfully");
  } catch (error) {
    message.error("Failed to save data");
    console.error(error);
  }
};
</script>
