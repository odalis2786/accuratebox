<template>
  <a-form
    :model="formState"
    :label-col="{ span: 4 }"
    :wrapper-col="{ span: 14 }"
    @submit.prevent="onSubmit"
    style="padding-bottom: 80px"
  >
    <a-form-item label="Work Keys">
      <a-textarea v-model:value="formState.desc" />
    </a-form-item>
    <a-form-item label="Comment">
      <a-textarea v-model:value="formState.comentario" />
    </a-form-item>

    <a-form-item label="Tipo de Servicio">
      <a-radio-group v-model:value="formState.type">
        <a-radio-button value="Internal">Internal</a-radio-button>
        <a-radio-button value="External">External</a-radio-button>
        <a-radio-button value="Diario">Diario</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item label="Machine" @click="showModal">
      <a-input-search
        v-model:value="formState.maquina"
        placeholder="Select a machine"
        @click="showModal"
        readonly
      />
    </a-form-item>
    <a-form-item label="Priority">
      <a-radio-group v-model:value="formState.prioriti">
        <a-radio-button value="1">1</a-radio-button>
        <a-radio-button value="2">2</a-radio-button>
        <a-radio-button value="3">3</a-radio-button>
        <a-radio-button value="4">4</a-radio-button>
        <a-radio-button value="5">5</a-radio-button>
      </a-radio-group>
    </a-form-item>

    <a-form-item label="Images">
      <a-upload
        list-type="picture-card"
        multiple
        :before-upload="beforeUpload"
        :file-list="fileList"
        @change="handleChange"
      >
        <div>
          <div style="margin-top: 8px">Upload</div>
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
        <template v-else> Create Order </template>
      </a-button>
    </a-form-item>

    <!-- Modal for selecting machine -->
    <a-modal
      :open="isModalVisible"
      title="Select a machine"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <a-list bordered :dataSource="maquinas" :renderItem="renderItem">
        <template #renderItem="{ item }">
          <a-list-item @click="() => selectMachine(item)">
            <div class="list-item-content">
              <a-avatar :src="item.imageUrls[0]" />
              <span class="list-item-name">{{ item.nombre }}</span>
            </div>
          </a-list-item>
        </template>
      </a-list>
    </a-modal>
  </a-form>
</template>

<script setup>
import { reactive, ref, onMounted } from "vue";
import { useDatabaseStore } from "../stores/database.js";
import { message } from "ant-design-vue";

const database = useDatabaseStore();
const fileList = ref([]);
const maquinas = ref([]);
const isModalVisible = ref(false);

const formState = reactive({
  prioriti: "",
  type: "",
  desc: "",
  Status: "",
  coment: "",
  comentario: "",
  maquina: "", // Añadido campo maquina
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

// Función para cargar las máquinas desde la base de datos
const loadMaquinas = async () => {
  try {
    await database.getMaquinas(); // Asegúrate de que tu store tenga un método getMaquinas
    maquinas.value = database.maquinas;
  } catch (error) {
    console.log("Error al cargar las máquinas", error);
    message.error("Error al cargar las máquinas.");
  }
};

// Llama a la función para cargar las máquinas cuando el componente se monta
onMounted(() => {
  loadMaquinas();
});

// Funciones para manejar el modal
const showModal = () => {
  isModalVisible.value = true;
};

const handleOk = () => {
  isModalVisible.value = false;
};

const handleCancel = () => {
  isModalVisible.value = false;
};

const selectMachine = (item) => {
  formState.maquina = item.nombre;
  handleOk();
};

const onSubmit = async () => {
  // Extraer los archivos de la lista de archivos de a-upload
  const files = fileList.value.map((file) => file.originFileObj);

  try {
    // Invoca la acción del store para añadir la orden de trabajo y subir las imágenes
    await database.addWorkOrder({ ...formState }, files);

    // Limpieza después de la subida
    Object.keys(formState).forEach((key) => (formState[key] = ""));
    fileList.value = [];
  } catch (error) {
    console.log("Error", error);

    message.error("Error al guardar la orden de trabajo e imágenes.");
  }
};
</script>
<style scoped>
.list-item-content {
  display: flex;
  align-items: center;
}

.list-item-name {
  margin-left: 8px;
}
</style>
