<template>
  <div class="parts-entry-container">
    <a-card class="parts-entry-card" :bordered="false">
      <!-- Header Section -->
      <div class="form-header">
        <div class="header-content">
          <div class="header-icon">
            <ToolOutlined />
          </div>
          <div class="header-text">
            <h2 class="form-title">Add New Part</h2>
            <p class="form-subtitle">Enter part details and upload images</p>
          </div>
        </div>
        <div class="progress-indicator">
          <a-progress
            :percent="progressPercent"
            :show-info="false"
            stroke-color="#667eea"
            trail-color="#f1f5f9"
            :size="4"
          />
        </div>
      </div>

      <a-divider class="form-divider" />

      <!-- Form Content -->
      <a-form
        :model="formState"
        :rules="rules"
        ref="formRef"
        layout="vertical"
        @submit.prevent="onSubmit"
        class="modern-form"
      >
        <!-- Basic Information Section -->
        <div class="form-section">
          <h3 class="section-title">
            <InfoCircleOutlined class="section-icon" />
            Basic Information
          </h3>
          
          <a-row :gutter="24">
            <a-col :xs="24" :sm="12">
              <a-form-item 
                label="Part Name" 
                name="name"
                class="form-item-modern"
              >
                <a-input 
                  v-model:value="formState.name" 
                  placeholder="Enter part name"
                  size="large"
                  class="modern-input"
                >
                  <template #prefix>
                    <TagOutlined class="input-icon" />
                  </template>
                </a-input>
              </a-form-item>
            </a-col>
            
            <a-col :xs="24" :sm="12">
              <a-form-item 
                label="Quantity" 
                name="cuantiti"
                class="form-item-modern"
              >
                <a-input-number 
                  v-model:value="formState.cuantiti" 
                  placeholder="Enter quantity"
                  size="large"
                  class="modern-input"
                  :min="0"
                  style="width: 100%"
                >
                  <template #prefix>
                    <NumberOutlined class="input-icon" />
                  </template>
                </a-input-number>
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="24">
            <a-col :xs="24" :sm="12">
              <a-form-item 
                label="Location" 
                name="location"
                class="form-item-modern"
              >
                <a-input 
                  v-model:value="formState.location" 
                  placeholder="Storage location"
                  size="large"
                  class="modern-input"
                >
                  <template #prefix>
                    <EnvironmentOutlined class="input-icon" />
                  </template>
                </a-input>
              </a-form-item>
            </a-col>
            
            <a-col :xs="24" :sm="12">
              <a-form-item 
                label="Associated Machine" 
                name="machine"
                class="form-item-modern"
              >
                <a-input 
                  v-model:value="formState.machine" 
                  placeholder="Machine name or ID"
                  size="large"
                  class="modern-input"
                >
                  <template #prefix>
                    <SettingOutlined class="input-icon" />
                  </template>
                </a-input>
              </a-form-item>
            </a-col>
          </a-row>
        </div>

        <!-- Description Section -->
        <div class="form-section">
          <h3 class="section-title">
            <FileTextOutlined class="section-icon" />
            Description
          </h3>
          
          <a-form-item 
            label="Part Description" 
            name="desc"
            class="form-item-modern"
          >
            <a-textarea 
              v-model:value="formState.desc" 
              placeholder="Detailed description of the part..."
              :rows="4"
              size="large"
              class="modern-textarea"
              show-count
              :maxlength="500"
            />
          </a-form-item>
        </div>

        <!-- Images Section -->
        <div class="form-section">
          <h3 class="section-title">
            <CameraOutlined class="section-icon" />
            Part Images
          </h3>
          
          <div class="upload-section-content">
            <p class="upload-description">
              Add photos of the part to help with identification and inventory management.
              You can upload up to 8 images.
            </p>
            
            <div class="upload-container">
              <a-upload
                list-type="picture-card"
                multiple
                :before-upload="beforeUpload"
                :file-list="fileList"
                @change="handleChange"
                class="modern-upload"
                :show-upload-list="{
                  showPreviewIcon: true,
                  showRemoveIcon: true,
                  showDownloadIcon: false
                }"
              >
                <div class="upload-button" v-if="fileList.length < 8">
                  <div class="upload-icon-container">
                    <CameraOutlined class="upload-icon" />
                  </div>
                   
                </div>
              </a-upload>
            </div>
            
            <div class="upload-status">
              <div class="upload-info" v-if="fileList.length > 0">
                <CheckCircleOutlined class="info-icon" />
                <span>{{ fileList.length }} of 8 images uploaded</span>
              </div>
              <div class="upload-tips" v-else>
                <InfoCircleOutlined class="tip-icon" />
                <span>Click or drag images to upload</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="form-actions">
          <a-space size="large">
            <a-button 
              size="large" 
              @click="resetForm"
              class="reset-btn"
            >
              <ReloadOutlined /> Reset Form
            </a-button>
            
            <a-button 
              type="primary" 
              size="large"
              @click="onSubmit"
              :loading="userStore.loadingUser"
              class="submit-btn"
            >
              <template v-if="userStore.loadingUser">
                <LoadingOutlined /> Saving...
              </template>
              <template v-else>
                <SaveOutlined /> Save Part
              </template>
            </a-button>
          </a-space>
        </div>
      </a-form>
    </a-card>
  </div>
</template>

<script setup>
import { reactive, ref, computed, watch } from "vue";
import { useUserStore } from "../stores/user.js";
import { message } from "ant-design-vue";
import {
  ToolOutlined,
  InfoCircleOutlined,
  TagOutlined,
  NumberOutlined,
  EnvironmentOutlined,
  SettingOutlined,
  FileTextOutlined,
  CameraOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  SaveOutlined,
  LoadingOutlined,
} from "@ant-design/icons-vue";

const userStore = useUserStore();
const fileList = ref([]);
const formRef = ref();

const formState = reactive({
  name: "",
  location: "",
  machine: "",
  desc: "",
  cuantiti: 0,
});

// Form validation rules
const rules = {
  name: [
    { required: true, message: 'Please enter part name', trigger: 'blur' },
    { min: 2, max: 100, message: 'Name should be 2-100 characters', trigger: 'blur' }
  ],
  location: [
    { required: true, message: 'Please enter location', trigger: 'blur' }
  ],
  cuantiti: [
    { required: true, message: 'Please enter quantity', trigger: 'blur' },
    { type: 'number', min: 0, message: 'Quantity must be a positive number', trigger: 'blur' }
  ],
  desc: [
    { required: true, message: 'Please enter description', trigger: 'blur' },
    { min: 10, max: 500, message: 'Description should be 10-500 characters', trigger: 'blur' }
  ],
  machine: [
    { required: true, message: 'Please enter associated machine', trigger: 'blur' }
  ]
};

// Progress calculation based on filled fields
const progressPercent = computed(() => {
  const fields = ['name', 'location', 'machine', 'desc'];
  const filledFields = fields.filter(field => formState[field] && formState[field].toString().trim());
  const quantityFilled = formState.cuantiti > 0 ? 1 : 0;
  const imagesFilled = fileList.value.length > 0 ? 1 : 0;
  
  return Math.round(((filledFields.length + quantityFilled + imagesFilled) / 6) * 100);
});

// File upload validation
const beforeUpload = (file) => {
  const isValidType = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp';
  if (!isValidType) {
    message.error('You can only upload JPG, PNG, or WebP files!');
    return false;
  }
  
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error('Image must be smaller than 2MB!');
    return false;
  }
  
  const totalFiles = fileList.value.length;
  if (totalFiles >= 8) {
    message.error('You can only upload up to 8 images!');
    return false;
  }
  
  return false; // Prevent automatic upload
};

// Handle file list changes
const handleChange = ({ fileList: newFileList }) => {
  fileList.value = newFileList.filter(file => file.status !== 'error');
};

// Reset form function
const resetForm = () => {
  formRef.value?.resetFields();
  Object.keys(formState).forEach((key) => {
    if (key === 'cuantiti') {
      formState[key] = 0;
    } else {
      formState[key] = "";
    }
  });
  fileList.value = [];
  message.info('Form has been reset');
};

// Form submission
const onSubmit = async () => {
  try {
    // Validate form first
    await formRef.value?.validate();
    
    // Validate images
    if (fileList.value.length === 0) {
      message.warning('Please upload at least one image');
      return;
    }
    
    // Extract files from file list
    const files = fileList.value.map((file) => file.originFileObj);
    
    // Show loading message
    const loadingMessage = message.loading('Saving part...', 0);
    
    try {
      // Save part with images
      await userStore.addParts({ ...formState }, files);
      
      // Success feedback
      loadingMessage();
      message.success('Part saved successfully!');
      
      // Reset form after successful submission
      resetForm();
      
    } catch (error) {
      loadingMessage();
      throw error;
    }
    
  } catch (error) {
    console.error("Validation or submission error:", error);
    
    if (error.errorFields) {
      message.error('Please check the form fields and try again');
    } else {
      message.error('Error saving part. Please try again.');
    }
  }
};

// Watch for form changes to provide real-time feedback
watch(() => formState.name, (newName) => {
  if (newName && newName.length < 2) {
    // Could add real-time validation feedback here
  }
});
</script>

<style scoped>
.parts-entry-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.parts-entry-card {
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  background: #fff;
}

/* Header Section */
.form-header {
  padding: 32px 32px 16px 32px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.header-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 28px;
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.header-text {
  flex: 1;
}

.form-title {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.form-subtitle {
  margin: 0;
  color: #64748b;
  font-size: 16px;
}

.progress-indicator {
  margin-top: 16px;
}

.form-divider {
  margin: 0;
  border-color: #e2e8f0;
}

/* Form Sections */
.modern-form {
  padding: 32px;
}

.form-section {
  margin-bottom: 40px;
  background: #f8fafc;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.form-section:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 24px 0;
  font-size: 20px;
  font-weight: 600;
  color: #374151;
}

.section-icon {
  color: #667eea;
  font-size: 22px;
}

/* Form Items */
.form-item-modern {
  margin-bottom: 24px;
}

.form-item-modern .ant-form-item-label > label {
  font-weight: 600;
  color: #374151;
  font-size: 16px;
}

.modern-input {
  border-radius: 8px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
}

.modern-input:hover {
  border-color: #cbd5e1;
}

.modern-input:focus,
.modern-input.ant-input-focused {
  border-color: #667eea !important;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
}

.modern-textarea {
  border-radius: 8px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
  resize: vertical;
}

.modern-textarea:hover {
  border-color: #cbd5e1;
}

.modern-textarea:focus,
.modern-textarea.ant-input-focused {
  border-color: #667eea !important;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
}

.input-icon {
  color: #667eea;
  font-size: 16px;
}

/* Upload Section */
.upload-section-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.upload-description {
  color: #64748b;
  font-size: 15px;
  line-height: 1.5;
  margin: 0;
  padding: 16px 20px;
  background: rgba(102, 126, 234, 0.05);
  border-left: 4px solid #667eea;
  border-radius: 0 8px 8px 0;
}

.upload-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modern-upload {
  width: 100%;
}

.upload-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 2px 2px;
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  transition: all 0.3s ease;
  cursor: pointer;
  height: 100px;
  position: relative;
  overflow: hidden;
}

.upload-button:hover {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(102, 126, 234, 0.05) 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
}

.upload-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left 0.5s;
}

.upload-button:hover::before {
  left: 100%;
}

.upload-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.upload-button:hover .upload-icon-container {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 12px 30px rgba(102, 126, 234, 0.4);
}

.upload-icon {
  font-size: 22px;
  color: white;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.upload-text {
  font-weight: 600;
  font-size: 16px;
  color: #374151;
  margin: 0;
}

.upload-hint {
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
  margin: 0;
}

.upload-status {
  display: flex;
  justify-content: center;
}

.upload-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%);
  border: 2px solid rgba(34, 197, 94, 0.2);
  border-radius: 10px;
  color: #166534;
  font-weight: 600;
  font-size: 15px;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.1);
}

.upload-tips {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(102, 126, 234, 0.05) 100%);
  border: 2px solid rgba(102, 126, 234, 0.2);
  border-radius: 10px;
  color: #4338ca;
  font-weight: 500;
  font-size: 14px;
}

.info-icon {
  color: #22c55e;
  font-size: 18px;
  animation: pulse 2s infinite;
}

.tip-icon {
  color: #667eea;
  font-size: 16px;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

/* Action Buttons */
.form-actions {
  display: flex;
  justify-content: center;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
}

.reset-btn {
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.reset-btn:hover {
  border-color: #f59e0b;
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.05);
}

.submit-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
}

.submit-btn:active {
  transform: translateY(0);
}

/* Responsive Design */
@media (max-width: 768px) {
  .parts-entry-container {
    padding: 16px;
  }
  
  .form-header {
    padding: 24px 24px 16px 24px;
  }
  
  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .form-title {
    font-size: 24px;
  }
  
  .modern-form {
    padding: 24px 16px;
  }
  
  .form-section {
    padding: 20px 16px;
  }
  
  .upload-button {
    flex-direction: column;
    gap: 12px;
    padding: 20px 16px;
    min-height: 120px;
  }
  
  .upload-icon-container {
    width: 44px;
    height: 44px;
  }
  
  .upload-icon {
    font-size: 20px;
  }
  
  .upload-content {
    align-items: center;
    text-align: center;
  }
  
  .upload-text {
    font-size: 15px;
  }
  
  .form-actions {
    flex-direction: column;
    gap: 12px;
  }
  
  .form-actions .ant-space {
    width: 100%;
  }
  
  .form-actions .ant-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .header-icon {
    width: 56px;
    height: 56px;
    font-size: 24px;
  }
  
  .form-title {
    font-size: 20px;
  }
  
  .section-title {
    font-size: 18px;
  }
}

/* Animation */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-section {
  animation: fadeInUp 0.5s ease-out;
}

.form-section:nth-child(2) {
  animation-delay: 0.1s;
}

.form-section:nth-child(3) {
  animation-delay: 0.2s;
}

.form-section:nth-child(4) {
  animation-delay: 0.3s;
}

/* Ant Design Overrides */
.ant-upload-list-picture-card .ant-upload-list-item {
  border-radius: 8px;
  border: 2px solid #e2e8f0;
}

.ant-upload-list-picture-card .ant-upload-list-item:hover {
  border-color: #667eea;
}

.ant-progress-line {
  border-radius: 4px;
}

.ant-input-number {
  border-radius: 8px;
  border: 2px solid #e2e8f0;
}

.ant-input-number:hover {
  border-color: #cbd5e1;
}

.ant-input-number:focus,
.ant-input-number-focused {
  border-color: #667eea !important;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
}

.ant-form-item-has-error .ant-input,
.ant-form-item-has-error .ant-input-number,
.ant-form-item-has-error .ant-select-selector {
  border-color: #ef4444 !important;
}

.ant-form-item-has-error .ant-form-item-explain-error {
  color: #ef4444;
  font-weight: 500;
}
</style>
