<template>
  <div class="form-container">
    <a-form :model="userData" layout="vertical" required-mark="optional">
      <a-form-item
        label="Nombre"
        name="name"
        :rules="[
          {
            required: true,
            message: 'Por favor ingresa el nombre del usuario!',
          },
        ]"
      >
        <a-input v-model:value="userData.name" />
      </a-form-item>

      <a-form-item
        label="Correo Electrónico"
        name="email"
        :rules="[
          { type: 'email', message: '¡El correo electrónico no es válido!' },
          {
            required: true,
            message: '¡Por favor ingresa el correo electrónico!',
          },
        ]"
      >
        <a-input v-model:value="userData.email" />
      </a-form-item>

      <a-form-item
        label="Posición"
        name="position"
        :rules="[
          {
            required: true,
            message: '¡Por favor selecciona la posición del usuario!',
          },
        ]"
      >
        <a-select
          v-model:value="userData.position"
          placeholder="Selecciona una posición"
          allow-clear
        >
          <a-select-option value="Mechanic">Mechanic</a-select-option>
          <a-select-option value="QA">QA</a-select-option>
          <a-select-option value="Operator">Operator</a-select-option>
          <a-select-option value="Admin">Admin</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item>
        <a-space>
          <a-button type="default" @click="goBack">Back</a-button>
          <a-button type="primary" @click="onSubmit">Add User</a-button>
        </a-space>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/user";

const userData = ref({
  name: "",
  email: "",
  position: "",
});

const router = useRouter();

const onSubmit = async () => {
  const userStore = useUserStore();
  console.log("Form data:", userData.value);

  // Llama a la acción addUser de tu store de Pinia, pasando userData.value como argumento
  await userStore.addUser(userData.value);
  userData.value = "";
};

const goBack = () => {
  router.back(); // Usa la instancia del router para volver a la página anterior
};
</script>

<style scoped>
.form-container {
  display: flex;
  justify-content: center; /* Centra el formulario horizontalmente */
  padding: 20px;
}

.a-form {
  width: 40%; /* Establece el ancho del formulario al 40% del contenedor */
  min-width: 300px; /* Opcional: Evita que el formulario sea demasiado pequeño en pantallas estrechas */
}
</style>
