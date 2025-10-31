<template>
  <div class="container mt-4">
    <h1 class="mb-4" style="text-align:center;">Walk-in Retarder</h1>
    <Row  >
      <!-- Sensor Centro -->
      <Col xs="24" md="12" style="margin: 10px;">
        <Card title="Door Sensor" bordered hoverable>
          <Table
            :columns="columns"
            :data-source="centroTableData"
            pagination="false"
            size="small"
          ></Table>
          <div class="mt-2">
            <h3 class="mb-2">Update Limits</h3>
            <div class="mb-2">
              <label class="mr-2">High Limit (°F):</label>
              <InputNumber v-model:value="newTemperatureLimits.centro_sensor.high" />
            </div>
            <div class="mb-2">
              <label class="mr-2">Low Limit (°F):</label>
              <InputNumber v-model:value="newTemperatureLimits.centro_sensor.low" />
            </div>
            <Button type="primary"   @click="saveLimits('centro_sensor')">Save</Button>
          </div>
        </Card>
      </Col>

      <!-- Sensor Puerta -->
      <Col xs="24" md="12" style="margin: 10px;">
        <Card title="Center Sensor" bordered hoverable>
          <Table
            :columns="columns"
            :data-source="puertaTableData"
            pagination="false"
            size="small"
          ></Table>
          <div class="mt-2">
            <h3 class="mb-2">Update Limits</h3>
            <div class="mb-2">
              <label class="mr-2">High Limit (°F):</label>
              <InputNumber v-model:value="newTemperatureLimits.puerta_sensor.high" />
            </div>
            <div class="mb-2">
              <label class="mr-2">Low Limit (°F):</label>
              <InputNumber v-model:value="newTemperatureLimits.puerta_sensor.low" />
            </div>
            <Button type="primary"   @click="saveLimits('puerta_sensor')">Save</Button>
          </div>
        </Card>
      </Col>
      <!-- Email Alerts Management -->
  
      <Col xs="24" md="12">
        <Card title="Email Alerts Management" bordered hoverable>
          <!-- Input to add emails -->
          <div class="mb-3">
            <Input
              placeholder="Enter email for alerts"
              v-model:value="email"
              style="width: 300px; margin-right: 10px"
            />
            <Button type="primary"   @click="addEmail">Add Email</Button>
          </div>

            <!-- Descripción de los correos electrónicos -->
            <a-descriptions
            :column="{ xxl: 1, xl: 1, lg: 1, md: 1, sm: 1, xs: 1 }"
            :bordered="true"
            title="Alert Emails"
          >
            <a-descriptions-item
              v-for="email in alertEmails"
              :key="email.id"
              :label="email.email"
            >
              <Button type="primary" @click="showDeleteModal(email.id)">Remove</Button>
            </a-descriptions-item>
          </a-descriptions>
        </Card>
      </Col>
    </Row>

 
     <!-- Modal de confirmación -->
     <Modal
      v-model:visible="isModalVisible"
      title="Confirm Deletion"
      @ok="confirmDelete"
      @cancel="cancelDelete"
    >
      <p>Are you sure you want to delete this email?</p>
    </Modal>



  </div>
</template>

<script setup>
 
import { onMounted, computed,reactive,ref,h } from "vue";
import { useDatabaseStore } from "@/stores/database";
import { Table, Card, Row, Col, InputNumber, Button ,Input, Modal} from "ant-design-vue";
import { message } from "ant-design-vue";
const email = ref(""); // Para el input de correo
const alertEmails = ref([]); // Lista de correos almacenados

const isModalVisible = ref(false); // Estado del modal
const emailToDelete = ref(null); // Email a eliminar
 





const databaseStore = useDatabaseStore();
const sensors = ref({});
const temperatureLimits = ref({});
const newTemperatureLimits = ref({
  centro_sensor: { high: null, low: null },
  puerta_sensor: { high: null, low: null },
});



// Validar formato de correo
const isValidEmail = (email) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 
  return emailPattern.test(email);
};

// Agregar un nuevo correo
const addEmail = async () => {
  if (!isValidEmail(email.value)) {
    message.error("Invalid email format");
    return;
  }
  
  try {
     
    const emailId = await databaseStore.saveAlertEmail(email.value);
    alertEmails.value.push({ id: emailId, email: email.value });
    email.value = ""; // Limpiar el input
    message.success(`Email ${email.value} saved successfully`);
  } catch (error) {
    console.error("Error adding email:", error);
 
  }
};

// Método para obtener los correos electrónicos guardados
const fetchAlertEmails = async () => {
   
  try {
    const emails = await databaseStore.fetchAlertEmails();
    alertEmails.value = emails;
    console.log("Emails", emails);
  } catch (error) {
    console.error("Error fetching alert emails:", error);
  }
};


 






// Mostrar el modal de confirmación
const showDeleteModal = (id) => {
  emailToDelete.value = id;
  isModalVisible.value = true;
};

// Confirmar eliminación
const confirmDelete = async () => {
  if (emailToDelete.value) {
    await removeEmail(emailToDelete.value);
    isModalVisible.value = false;
    emailToDelete.value = null;
  }
};

// Eliminar email
const removeEmail = async (id) => {
  try {
    await databaseStore.deleteAlertEmail(id);
    alertEmails.value = alertEmails.value.filter(email => email.id !== id);
    message.warning("Email deleted successfully");
  } catch (error) {
    console.error("Error removing email:", error);
  }
};













// Cancelar eliminación
const cancelDelete = () => {
  isModalVisible.value = false;
  emailToDelete.value = null;
};





























const fetchSensorsAndLimits = async () => {
  const sensorData = await databaseStore.fetchSensorsData();
  const limitData = await databaseStore.fetchSensorLimits();

  if (sensorData) {
    sensors.value = sensorData;
  }

  if (limitData) {
    temperatureLimits.value = limitData;
    if (limitData.centro_sensor) {
      newTemperatureLimits.value.centro_sensor.high =
        limitData.centro_sensor.temperature_limit_high || null;
      newTemperatureLimits.value.centro_sensor.low =
        limitData.centro_sensor.temperature_limit_low || null;
    }
    if (limitData.puerta_sensor) {
      newTemperatureLimits.value.puerta_sensor.high =
        limitData.puerta_sensor.temperature_limit_high || null;
      newTemperatureLimits.value.puerta_sensor.low =
        limitData.puerta_sensor.temperature_limit_low || null;
    }
  }
};

const saveLimits = async (sensorId) => {
  const { high, low } = newTemperatureLimits.value[sensorId];
  if (high !== null && low !== null) {
    await databaseStore.updateTemperatureLimits(sensorId, { high, low });
    const timestamp = new Date().toISOString();
    temperatureLimits.value[sensorId] = {
      ...temperatureLimits.value[sensorId],
      temperature_limit_high: high,
      temperature_limit_low: low,
      limit_set_date_high: timestamp,
      limit_set_date_low: timestamp,
    };
    newTemperatureLimits.value[sensorId].high = null;
    newTemperatureLimits.value[sensorId].low = null;
  }
};

onMounted(() => {
  fetchAlertEmails();
  fetchSensorsAndLimits();
  setInterval(fetchSensorsAndLimits, 60000);
});

const columns = [
  {
    title: "Field",
    dataIndex: "field",
    key: "field",
    width: "40%",
  },
  {
    title: "Value",
    dataIndex: "value",
    key: "value",
  },
];

const centroTableData = computed(() => {
  if (!sensors.value.centro_sensor || !temperatureLimits.value.centro_sensor) return [];
  const c = sensors.value.centro_sensor;
  const t = temperatureLimits.value.centro_sensor;
  return [
    { key: "1", field: "Temperature (°F)", value: c.temperature_fahrenheit },
    { key: "2", field: "Humidity (%)", value: c.humidity },
    { key: "3", field: "High Limit_set (°F)", value: t?.temperature_limit_high || "No set" },
    { key: "4", field: "Low Limit_set (°F)", value: t?.temperature_limit_low || "No set" },
  ];
});

const puertaTableData = computed(() => {
  if (!sensors.value.puerta_sensor || !temperatureLimits.value.puerta_sensor) return [];
  const p = sensors.value.puerta_sensor;
  const t = temperatureLimits.value.puerta_sensor;
  return [
    { key: "1", field: "Temperature (°F)", value: p.temperature_fahrenheit },
    { key: "2", field: "Humidity (%)", value: p.humidity },
    { key: "3", field: "High Limit_set (°F)", value: t?.temperature_limit_high || "No set" },
    { key: "4", field: "Low Limit_set (°F)", value: t?.temperature_limit_low || "No set" },
  ];
});
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
}
.mr-2 {
  margin-right: 8px;
}
.mt-2 {
  margin-top: 16px;
}
.mb-2 {
  margin-bottom: 16px;
}
</style>
