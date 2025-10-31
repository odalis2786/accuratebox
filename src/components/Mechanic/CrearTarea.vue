<template>
  <div class="mt-5">
    <h1>Crear Tarea</h1>
  </div>

  <a-form
    ref="formRef"
    :model="formState"
    :rules="rules"
    :label-col="{ span: 4 }"
    :wrapper-col="{ span: 14 }"
    @submit.prevent="handleSubmit"
  >
    <a-form-item
      label="Comentarios y materiales usados"
      :labelCol="{ span: 6 }"
      :wrapperCol="{ span: 18 }"
      name="comentario"
    >
      <a-textarea v-model:value="formState.comentario" />
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
        <a-button
          type="primary"
          @click="goBack"
          style="background-color: black; border-color: black"
        >
          <LeftOutlined style="margin-right: 8px" />
          Atras
        </a-button>
        <a-button
          type="primary"
          @click="handleSubmit"
          :disabled="database.loading"
        >
          <template v-if="database.loading">
            <a-spin />
          </template>
          <template v-else> Save </template>
        </a-button>
      </a-space>
    </a-form-item>
  </a-form>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useDatabaseStore } from "../../stores/database";
import { message } from "ant-design-vue";
import { useRouter } from "vue-router";
import { LeftOutlined } from "@ant-design/icons-vue";
import { useMenuStore } from "../../stores/menus"; // Importar el store

const menu = useMenuStore();
const router = useRouter();
const database = useDatabaseStore();
const fileList = ref([]);
const formRef = ref(null); // Referencia al formulario

const formState = reactive({
  comentario: "",
});

const rules = {
  comentario: [
    {
      required: true,
      message: "Por favor ingrese un comentario",
      trigger: "blur",
    },
  ],
};

const goBack = () => {
  console.log("Go back pulsado");
  menu.setSelectedKey("7");
};

const beforeUpload = (file) => {
  return false;
};

const handleChange = ({ fileList: newFileList }) => {
  fileList.value = newFileList;
};

const handleSubmit = () => {
  formRef.value
    .validate()
    .then(async () => {
      await onSubmit();
    })
    .catch((error) => {
      message.error("Por favor complete los campos requeridos");
    });
};

const onSubmit = async () => {
  database.loading = true; // Mostrar spinner y desactivar botón
  const files = fileList.value.map((file) => file.originFileObj);

  try {
    await database.CrearTarea({ ...formState }, files);
    Object.keys(formState).forEach((key) => (formState[key] = ""));
    fileList.value = [];
    message.success("Tarea e imágenes añadidas exitosamente.");
  } catch (error) {
    console.log("Error", error);
    message.error("Error al guardar la herramienta e imágenes.");
  } finally {
    database.loading = false; // Ocultar spinner y activar botón
  }
};
</script>

<style scoped>
.ant-form-item-label {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>
