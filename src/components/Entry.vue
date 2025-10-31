<template>
  <div>
    <a-form-item :wrapper-col="{ span: 18, offset: 2 }">
      <a-button type="primary" @click="showModal">New Tag</a-button>
    </a-form-item>
    <a-modal
      title="Agregar Nuevo Tag"
      :open="isModalVisible"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <a-form-item label="ID">
        <a-input
          v-model:value="tagForm.id"
          placeholder="Ingrese el ID del tag"
        ></a-input>
      </a-form-item>
      <a-form-item label="Nombre">
        <a-input
          v-model:value="tagForm.name"
          placeholder="Ingrese el nombre del tag"
        ></a-input>
      </a-form-item>
    </a-modal>
    <a-list item-layout="horizontal" :data-source="tags" bordered>
      <template #renderItem="{ item, index }">
        <a-list-item>
          <a-list-item-meta>
            <template #title>
              {{ item.name }}
            </template>
            <template #description> ID: {{ item.id }} </template>
          </a-list-item-meta>
          <a-button type="danger" @click="removeItem(item.id, index)"
            >Delete</a-button
          >
        </a-list-item>
      </template>
    </a-list>
  </div>
</template>

<script setup>
import { ref, onMounted, watchEffect, onUnmounted } from "vue";

import { useUserStore } from "../stores/user";
import { Modal, message } from "ant-design-vue";
import { useDatabaseStore } from "@/stores/database.js"; // Ajusta la ruta de importación según la ubicación de tu store
const database = useDatabaseStore();

const tags = ref([]);
const isModalVisible = ref(false);
const tagForm = ref({ id: "", name: "" });

// Mostrar modal
const showModal = () => {
  isModalVisible.value = true;
};

// Manejar OK del modal
const handleOk = async () => {
  // Elimina espacios en blanco al inicio y al final de los strings
  const trimmedId = tagForm.value.id.trim();
  const trimmedName = tagForm.value.name.trim();

  // Validación: Asegúrate de que ni el id ni el nombre estén vacíos
  if (!trimmedId || !trimmedName) {
    message.error("El ID y el nombre no pueden estar vacíos.");
    return; // Detiene la ejecución si hay un error de validación
  }

  // Validación: Asegúrate de que el ID sea numérico (opcional, basado en tu caso de uso)
  if (isNaN(trimmedId)) {
    message.error("El ID debe ser numérico.");
    return; // Detiene la ejecución si hay un error de validación
  }

  // Validación: Asegúrate de que el nombre tenga al menos 3 caracteres (ajusta según sea necesario)
  if (trimmedName.length < 3) {
    message.error("El nombre debe tener al menos 3 caracteres.");
    return; // Detiene la ejecución si hay un error de validación
  }

  try {
    await database.saveTag(tagForm.value.name, tagForm.value.id);
    // Asume que existe este método en tu store
    tags.value = database.tags; // Actualizar la lista de tags (Asume que `tags` es reactiva en tu store)
    isModalVisible.value = false;
    message.success("Tag agregado con éxito");
  } catch (error) {
    console.error("Error al agregar el tag:", error);
    message.error("Error al agregar el tag");
  }
};

// Manejar Cancelar del modal
const handleCancel = () => {
  isModalVisible.value = false;
};
onMounted(async () => {
  if (tags.value.length === 0) {
    // Verifica si tags ya tiene datos
    await database.Entry();
    tags.value = database.tags;
  }
});

onUnmounted(() => {
  tags.value = []; // Limpia el array al desmontar el componente
});
// Función para eliminar el elemento
const removeItem = async (id, index) => {
  // Muestra un diálogo de confirmación
  if (window.confirm("¿Estás seguro de que deseas eliminar este tag?")) {
    try {
      // Si el usuario confirma, llama a la función que eliminará el elemento de la base de datos
      await database.deleteTag(id);
      // Y luego elimina el elemento de `tags` localmente
      tags.value.splice(index, 1);
    } catch (error) {
      console.error("Error al eliminar el tag:", error);
    }
  }
};
</script>
