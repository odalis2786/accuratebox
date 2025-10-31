<template>
  <div class="profile-page">
    <a-card class="profile-card" :bordered="false">
      <!-- Header con avatar y info básica -->
      <div class="profile-header">
        <div class="avatar-section">
          <a-badge :count="fileList.length" :show-zero="false" color="#52c41a">
            <a-avatar
              v-if="userStore.userData.photoUrl"
              :size="120"
              :src="userStore.userData.photoUrl"
              class="profile-avatar"
            />
            <a-avatar v-else :size="120" class="profile-avatar">
              <template #icon><UserOutlined /></template>
            </a-avatar>
          </a-badge>
          
          <div class="upload-section">
            <a-upload
              v-model:file-list="fileList"
              name="file"
              :before-upload="beforeUpload"
              @remove="handleRemove"
              :show-upload-list="false"
              :max-count="1"
            >
              <a-button type="dashed" size="small" class="upload-btn">
                <CameraOutlined /> Cambiar Foto
              </a-button>
            </a-upload>
            
            <a-button
              v-if="fileList.length > 0"
              :disabled="subir || userStore.loadingUser"
              type="primary"
              size="small"
              :loading="uploading || userStore.loadingUser"
              @click="handleUpload"
              class="update-btn"
            >
              <CloudUploadOutlined /> {{ uploading ? "Subiendo..." : "Actualizar" }}
            </a-button>
          </div>
        </div>

        <div class="user-info">
          <h2 class="user-name">{{ userStore.userData.nombre || 'Sin nombre' }}</h2>
          <a-tag color="blue" class="user-role">
            <TeamOutlined /> {{ userStore.userData.position || 'Sin posición' }}
          </a-tag>
          <p class="user-email">
            <MailOutlined /> {{ userStore.userData.email || 'Sin email' }}
          </p>
        </div>
      </div>

      <a-divider />

      <!-- Secciones editables organizadas en tabs -->
      <a-tabs v-model:activeKey="activeTab" type="card" class="profile-tabs">
        
        <!-- Información Personal -->
        <a-tab-pane key="personal" tab="Información Personal">
          <div class="form-section">
            <a-space direction="vertical" :size="24" style="width: 100%">
              
              <!-- Nombre -->
              <div class="form-item">
                <div class="form-label">
                  <UserOutlined class="label-icon" />
                  <span>Nombre Completo</span>
                </div>
                <div class="form-content">
                  <div v-if="Editname" class="display-value">
                    <span class="value-text">{{ userStore.userData.nombre || 'No especificado' }}</span>
                    <a-button type="link" @click="startEdit('name')" class="edit-btn">
                      <EditOutlined /> Editar
                    </a-button>
                  </div>
                  <div v-else class="edit-form">
                    <a-input
                      v-model:value="Datos.name"
                      placeholder="Ingresa tu nombre completo"
                      size="large"
                      class="edit-input"
                    />
                    <div class="form-actions">
                      <a-button type="primary" @click="Save('name')" size="small">
                        <CheckOutlined /> Guardar
                      </a-button>
                      <a-button @click="cancelEdit('name')" size="small">
                        <CloseOutlined /> Cancelar
                      </a-button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Email -->
              <div class="form-item">
                <div class="form-label">
                  <MailOutlined class="label-icon" />
                  <span>Correo Electrónico</span>
                </div>
                <div class="form-content">
                  <div v-if="EditEmail" class="display-value">
                    <span class="value-text">{{ userStore.userData.email || 'No especificado' }}</span>
                    <a-button type="link" @click="startEdit('email')" class="edit-btn">
                      <EditOutlined /> Editar
                    </a-button>
                  </div>
                  <div v-else class="edit-form">
                    <a-input
                      v-model:value="Datos.email"
                      placeholder="Ingresa tu correo electrónico"
                      size="large"
                      type="email"
                      class="edit-input"
                    />
                    <div class="form-actions">
                      <a-button type="primary" @click="Save('email')" size="small">
                        <CheckOutlined /> Guardar
                      </a-button>
                      <a-button @click="cancelEdit('email')" size="small">
                        <CloseOutlined /> Cancelar
                      </a-button>
                    </div>
                  </div>
                </div>
              </div>

            </a-space>
          </div>
        </a-tab-pane>

        <!-- Seguridad -->
        <a-tab-pane key="security" tab="Seguridad">
          <div class="form-section">
            <a-alert
              message="Cambio de Contraseña"
              description="Por tu seguridad, necesitamos verificar tu contraseña actual antes de establecer una nueva."
              type="info"
              show-icon
              class="security-alert"
            />
            
            <a-space direction="vertical" :size="24" style="width: 100%">
              
              <div class="form-item">
                <div class="form-label">
                  <LockOutlined class="label-icon" />
                  <span>Contraseña Actual</span>
                </div>
                <div class="form-content">
                  <a-input-password
                    v-model:value="Datos.oldpassword"
                    placeholder="Ingresa tu contraseña actual"
                    size="large"
                    class="password-input"
                  />
                </div>
              </div>

              <div class="form-item">
                <div class="form-label">
                  <SafetyOutlined class="label-icon" />
                  <span>Nueva Contraseña</span>
                </div>
                <div class="form-content">
                  <a-input-password
                    v-model:value="Datos.newpassword"
                    placeholder="Ingresa tu nueva contraseña"
                    size="large"
                    class="password-input"
                  />
                  <div class="password-strength">
                    <small class="password-hint">
                      Mínimo 6 caracteres, incluye mayúsculas, minúsculas y símbolos
                    </small>
                  </div>
                </div>
              </div>

              <div class="form-item">
                <div class="form-label">
                  <CheckCircleOutlined class="label-icon" />
                  <span>Confirmar Contraseña</span>
                </div>
                <div class="form-content">
                  <a-input-password
                    v-model:value="Datos.repeatpassword"
                    placeholder="Confirma tu nueva contraseña"
                    size="large"
                    class="password-input"
                  />
                </div>
              </div>

              <div class="form-actions-center">
                <a-button 
                  type="primary" 
                  size="large"
                  @click="Save('password')"
                  :loading="userStore.loadingUser"
                  class="save-password-btn"
                >
                  <SafetyOutlined /> Actualizar Contraseña
                </a-button>
              </div>

            </a-space>
          </div>
        </a-tab-pane>

      </a-tabs>
    </a-card>
  </div>
</template>

<script setup>
import {
  UserOutlined,
  UploadOutlined,
  EyeOutlined,
  CameraOutlined,
  CloudUploadOutlined,
  TeamOutlined,
  MailOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  LockOutlined,
  SafetyOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons-vue";
import { ref, onMounted } from "vue";
import { message } from "ant-design-vue";
import { useUserStore } from "../stores/user";

const userStore = useUserStore();
const activeTab = ref("personal");

const subir = ref(true);
const uploading = ref(false);
const fileList = ref([]);

const Editname = ref(true);
const EditEmail = ref(true);
const Editpassword = ref(true);
const Datos = ref({
  email: "",
  name: "",
  newpassword: "",
  oldpassword: "",
  repeatpassword: "",
});

// Funciones para manejar la edición
const startEdit = (field) => {
  if (field === 'name') {
    Editname.value = false;
    Datos.value.name = userStore.userData.nombre || '';
  } else if (field === 'email') {
    EditEmail.value = false;
    Datos.value.email = userStore.userData.email || '';
  }
};

const cancelEdit = (field) => {
  if (field === 'name') {
    Editname.value = true;
    Datos.value.name = '';
  } else if (field === 'email') {
    EditEmail.value = true;
    Datos.value.email = '';
  }
};

const validateName = () => {
  if (typeof Datos.value.name !== "string") {
    message.error("The name must be a string.");
    return false;
  }
  if (!/^[A-Za-z ]+$/.test(Datos.value.name.trim())) {
    message.error("Please enter a name with only letters.");
    return false;
  }
  if (Datos.value.name.trim().length < 3) {
    message.error("Please enter a name with at least 3 characters.");
    return false;
  }
  return true;
};

const validateEmail = () => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!Datos.value.email.trim()) {
    message.error("Please enter a valid email address.");
    return false;
  } else if (!emailPattern.test(Datos.value.email)) {
    message.error("Please enter a valid email address.");
    return false;
  }
  return true;
};

const validatePassword = (newPassword, oldPassword) => {
  const messages = [];
  if (Datos.value.newpassword !== Datos.value.repeatpassword) {
    messages.push("The new password and repeat password do not match.");
  }
  if (newPassword.length < 6) {
    messages.push("The password must have at least 6 characters.");
  }
  if (!/[a-z]/.test(newPassword)) {
    messages.push("The password must contain at least one lowercase letter.");
  }
  if (!/[A-Z]/.test(newPassword)) {
    messages.push("The password must contain at least one uppercase letter.");
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
    messages.push("The password must contain at least one special character.");
  }
  if (newPassword === oldPassword) {
    messages.push("The new password cannot be the same as the old password.");
  }

  return messages.length > 0 ? messages.join("\n") : "Password is valid.";
};

const Save = async (field) => {
  try {
    if (field === "name" && validateName()) {
      await userStore.updateName(Datos.value.name);
      Editname.value = true;
      Datos.value.name = '';
      message.success('Nombre actualizado correctamente');
    } else if (field === "email" && validateEmail()) {
      await userStore.updateEmail(Datos.value.email);
      EditEmail.value = true;
      Datos.value.email = '';
      message.success('Email actualizado correctamente');
    } else if (field === "password") {
      const validationMessage = validatePassword(
        Datos.value.newpassword,
        Datos.value.oldpassword || Datos.value.password
      );
      if (validationMessage !== "Password is valid.") {
        message.error(validationMessage);
        return false;
      } else {
        await userStore.updatePassword(Datos.value);
        // Limpiar campos de contraseña después de actualizar
        Datos.value.oldpassword = '';
        Datos.value.newpassword = '';
        Datos.value.repeatpassword = '';
        message.success('Contraseña actualizada correctamente');
      }
    }
  } catch (error) {
    message.error(`Error al actualizar ${field}: ${error.message}`);
  }
};

const handleChange = (info) => {
  if (info.file.status !== "uploading") {
  }
  if (info.file.status === "done") {
    message.success(`${info.file.name} file uploaded successfully`);
  } else if (info.file.status === "error") {
    message.error(`${info.file.name} file upload failed.`);
  }
};

const handleRemove = (file) => {
  const index = fileList.value.indexOf(file);
  const newFileList = fileList.value.slice();
  newFileList.splice(index, 1);
  fileList.value = newFileList;
};

const beforeUpload = (file) => {
  const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
  if (!isJpgOrPng) {
    subir.value = true;
    message.error("You can only upload JPG or PNG files!");
    return;
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    subir.value = false;
    message.error("Image must smaller than 2MB!");
    return;
  }
  subir.value = false;
  return false;
};

const handleUpload = async () => {
  subir.value = true;
  await userStore.updatePhoto(fileList.value[0]);
  await userStore.getData();
  handleRemove(fileList.value[0]);
};

onMounted(async () => {
  await userStore.getData();
});
</script>

<style scoped>
.profile-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.profile-card {
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  background: #fff;
}

/* Header Section */
.profile-header {
  display: flex;
  align-items: center;
  gap: 32px;
  padding: 32px 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 16px 16px 0 0;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.profile-avatar {
  border: 4px solid #fff;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.profile-avatar:hover {
  transform: scale(1.05);
}

.upload-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.upload-btn {
  border-radius: 20px;
  border: 1px dashed #d9d9d9;
  background: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
}

.upload-btn:hover {
  border-color: #1890ff;
  background: rgba(24, 144, 255, 0.1);
}

.update-btn {
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-name {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  color: #2c3e50;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.user-role {
  font-size: 14px;
  padding: 6px 12px;
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  width: fit-content;
}

.user-email {
  color: #64748b;
  font-size: 16px;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Tabs */
.profile-tabs {
  margin-top: 16px;
}

.profile-tabs .ant-tabs-card > .ant-tabs-nav .ant-tabs-tab {
  border-radius: 8px 8px 0 0;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.profile-tabs .ant-tabs-card > .ant-tabs-nav .ant-tabs-tab-active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #667eea;
}

/* Form Sections */
.form-section {
  padding: 24px;
}

.form-item {
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.form-item:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
  font-size: 16px;
}

.label-icon {
  color: #667eea;
  font-size: 18px;
}

.form-content {
  width: 100%;
}

.display-value {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.value-text {
  font-size: 16px;
  color: #1f2937;
  font-weight: 500;
}

.edit-btn {
  color: #667eea;
  border: none;
  padding: 4px 12px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.edit-btn:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #5a67d8;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.edit-input {
  border-radius: 8px;
  border: 2px solid #e2e8f0;
  transition: border-color 0.3s ease;
}

.edit-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.form-actions-center {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.save-password-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  padding: 8px 24px;
  height: auto;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.save-password-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

/* Security Section */
.security-alert {
  margin-bottom: 24px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, rgba(24, 144, 255, 0.1) 0%, rgba(24, 144, 255, 0.05) 100%);
}

.password-input {
  border-radius: 8px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
}

.password-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.password-strength {
  margin-top: 8px;
}

.password-hint {
  color: #6b7280;
  font-style: italic;
}

/* Responsive Design */
@media (max-width: 768px) {
  .profile-page {
    padding: 16px;
  }
  
  .profile-header {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }
  
  .user-name {
    font-size: 24px;
  }
  
  .form-section {
    padding: 16px;
  }
  
  .display-value {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .form-actions {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .profile-avatar {
    width: 80px !important;
    height: 80px !important;
  }
  
  .user-name {
    font-size: 20px;
  }
  
  .form-item {
    padding: 16px;
  }
}

/* Animaciones */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-item {
  animation: fadeIn 0.5s ease-out;
}

/* Ant Design customizations */
.ant-tabs-card > .ant-tabs-nav .ant-tabs-tab-active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white !important;
}

.ant-tabs-card > .ant-tabs-nav .ant-tabs-tab-active .ant-tabs-tab-btn {
  color: white !important;
}

.ant-input-affix-wrapper:focus,
.ant-input-affix-wrapper-focused {
  border-color: #667eea !important;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2) !important;
}

.ant-btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.ant-btn-primary:hover {
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}
</style>
