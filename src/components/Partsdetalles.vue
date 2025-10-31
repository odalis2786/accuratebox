<template>
  <div v-if="articulo" class="part-details-container">
    <!-- Header Section -->
    <div class="header-section">
      <div class="header-content">
        <a-button 
          type="text" 
          class="back-btn"
          @click="goBack"
        >
          <ArrowLeftOutlined /> Back
        </a-button>
        <div class="page-title">
          <BoxPlotOutlined class="title-icon" />
          <h1>Part Details</h1>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="content-wrapper">
      <!-- Part Overview Card -->
      <a-card class="overview-card" :bordered="false">
        <div class="part-overview">
          <div class="part-image-section">
            <div class="image-container">
              <a-avatar 
                v-if="articulo.imageUrls && articulo.imageUrls.length" 
                :src="articulo.imageUrls[0]" 
                :size="120"
                class="part-image"
              />
              <a-avatar 
                v-else 
                :size="120"
                class="part-image default-image"
              >
                <BoxPlotOutlined />
              </a-avatar>
            </div>
            <div class="image-gallery" v-if="articulo.imageUrls && articulo.imageUrls.length > 1">
              <div class="gallery-item" v-for="(image, index) in articulo.imageUrls.slice(1, 4)" :key="index">
                <a-avatar :src="image" :size="40" />
              </div>
              <div v-if="articulo.imageUrls.length > 4" class="more-images">
                +{{ articulo.imageUrls.length - 4 }}
              </div>
            </div>
          </div>
          
          <div class="part-info-section">
            <div class="part-header">
              <h2 class="part-name">{{ articulo.name || 'Unknown Part' }}</h2>
              <a-tag class="part-id-tag">ID: {{ articulo.id }}</a-tag>
            </div>
            
            <p class="part-description">
              {{ articulo.desc || 'No description available' }}
            </p>
            
            <div class="quick-stats">
              <div class="stat-item quantity-stat">
                <div class="stat-icon">
                  <NumberOutlined />
                </div>
                <div class="stat-info">
                  <div class="stat-label">Current Stock</div>
                  <div class="stat-value">{{ articulo.model || 0 }} pieces</div>
                </div>
              </div>
              
              <div class="stat-item location-stat">
                <div class="stat-icon">
                  <EnvironmentOutlined />
                </div>
                <div class="stat-info">
                  <div class="stat-label">Location</div>
                  <div class="stat-value">{{ articulo.location || 'Not specified' }}</div>
                </div>
              </div>
              
              <div class="stat-item machine-stat">
                <div class="stat-icon">
                  <SettingOutlined />
                </div>
                <div class="stat-info">
                  <div class="stat-label">Machine</div>
                  <div class="stat-value">{{ articulo.machine || 'General' }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </a-card>

      <!-- Actions Card -->
      <a-card class="actions-card" :bordered="false">
        <div class="actions-header">
          <h3>Inventory Management</h3>
          <div class="current-quantity">
            <span class="quantity-label">Current Quantity:</span>
            <a-tag 
              :color="getQuantityColor(articulo.model)"
              class="quantity-tag"
            >
              {{ articulo.model || 0 }} pcs
            </a-tag>
          </div>
        </div>
        
        <div class="action-buttons">
          <a-button
            type="default"
            size="large"
            class="decrease-btn"
            @click="showModal('decrease')"
            :disabled="articulo.model <= 0"
          >
            <MinusOutlined /> Remove Stock
          </a-button>
          
          <a-button 
            type="primary" 
            size="large" 
            class="increase-btn"
            @click="showModal('increase')"
          >
            <PlusOutlined /> Add Stock
          </a-button>
        </div>
      </a-card>

      <!-- Detailed Information Card -->
      <a-card class="details-card" :bordered="false">
        <div class="details-header">
          <h3>Detailed Information</h3>
        </div>
        
        <div class="details-grid">
          <div class="detail-row">
            <div class="detail-label">
              <IdcardOutlined class="detail-icon" />
              Part ID
            </div>
            <div class="detail-value">{{ articulo.id }}</div>
          </div>
          
          <div class="detail-row">
            <div class="detail-label">
              <TagOutlined class="detail-icon" />
              Part Name
            </div>
            <div class="detail-value">{{ articulo.name || 'N/A' }}</div>
          </div>
          
          <div class="detail-row">
            <div class="detail-label">
              <EnvironmentOutlined class="detail-icon" />
              Location
            </div>
            <div class="detail-value">{{ articulo.location || 'Not specified' }}</div>
          </div>
          
          <div class="detail-row">
            <div class="detail-label">
              <FileTextOutlined class="detail-icon" />
              Description
            </div>
            <div class="detail-value description-text">{{ articulo.desc || 'No description available' }}</div>
          </div>
          
          <div class="detail-row">
            <div class="detail-label">
              <SettingOutlined class="detail-icon" />
              Machine
            </div>
            <div class="detail-value">{{ articulo.machine || 'General' }}</div>
          </div>
          
          <div class="detail-row">
            <div class="detail-label">
              <NumberOutlined class="detail-icon" />
              Quantity
            </div>
            <div class="detail-value">
              <a-tag 
                :color="getQuantityColor(articulo.model)"
                class="detail-quantity-tag"
              >
                {{ articulo.model || 0 }} pieces
              </a-tag>
            </div>
          </div>
        </div>
      </a-card>
    </div>
  </div>

 













  <!-- Empty State -->
  <div v-else class="empty-state">
    <a-card class="empty-card" :bordered="false">
      <a-empty 
        description="No part selected"
        :image="simpleImage"
      >
        <p class="empty-message">
          Please select a part from the parts list to view its details.
        </p>
        <a-button type="primary" @click="goBack" class="empty-back-btn">
          <ArrowLeftOutlined /> Go Back to Parts List
        </a-button>
      </a-empty>
    </a-card>
  </div>

  <!-- Modern Modal -->
  <a-modal
    v-model:visible="isModalVisible"
    :title="modalTitle"
    class="modern-modal"
    :width="500"
    @ok="handleOkPendiente"
    @cancel="handleCancelPendiente"
  >
    <div class="modal-content">
      <div class="modal-header">
        <div class="modal-icon">
          <component :is="modalAction === 'increase' ? PlusOutlined : MinusOutlined" />
        </div>
        <div class="modal-info">
          <h4>{{ modalAction === 'increase' ? 'Add Stock' : 'Remove Stock' }}</h4>
          <p>{{ modalAction === 'increase' ? 'Add parts to inventory' : 'Remove parts from inventory' }}</p>
        </div>
      </div>
      
      <div class="modal-form">
        <a-form layout="vertical">
          <a-form-item label="Quantity">
            <a-input-number
              v-model:value="quantityChange"
              :min="1"
              :max="modalAction === 'decrease' ? articulo?.model : 9999"
              size="large"
              placeholder="Enter quantity"
              style="width: 100%"
            />
          </a-form-item>
          
          <a-form-item label="Reason">
            <a-input
              v-model:value="comentario"
              placeholder="Enter reason for inventory change"
              size="large"
            />
          </a-form-item>
        </a-form>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { computed, ref } from "vue";
import { useUserStore } from "@/stores/user.js";
import { useRouter } from "vue-router";
import { Modal, Input, message, Empty } from "ant-design-vue";
import {
  ArrowLeftOutlined,
  BoxPlotOutlined,
  NumberOutlined,
  EnvironmentOutlined,
  SettingOutlined,
  MinusOutlined,
  PlusOutlined,
  IdcardOutlined,
  TagOutlined,
  FileTextOutlined,
} from "@ant-design/icons-vue";

const toolsStore = useUserStore();
const router = useRouter();
const isModalVisible = ref(false);
const modalAction = ref('increase');
const quantityChange = ref(1);
const comentario = ref('');
const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE;

// Recupera la parte seleccionada desde el store
const articulo = computed(() => toolsStore.PartsSeleccionado);

// Modal title based on action
const modalTitle = computed(() => {
  return modalAction.value === 'increase' ? 'Add Stock to Inventory' : 'Remove Stock from Inventory';
});

// Color function for quantity
const getQuantityColor = (quantity) => {
  const qty = parseInt(quantity) || 0;
  if (qty === 0) return 'red';
  if (qty <= 5) return 'orange';
  if (qty <= 20) return 'blue';
  return 'green';
};

// Redirige al usuario a la vista anterior
const goBack = () => {
  router.go(-1);
};

const showModal = (action) => {
  modalAction.value = action;
  isModalVisible.value = true;
  quantityChange.value = 1;
  comentario.value = ""; // Resetear el comentario cada vez que abres el modal
};

const handleCancelPendiente = () => {
  isModalVisible.value = false;
  quantityChange.value = 1;
  comentario.value = '';
};











const handleOkPendiente = async () => {
  if (!quantityChange.value || quantityChange.value <= 0) {
    message.error('Please enter a valid quantity');
    return;
  }

  if (!comentario.value.trim()) {
    message.error('Please provide a reason for the inventory change');
    return;
  }

  try {
    const delta = modalAction.value === 'increase' ? quantityChange.value : -quantityChange.value;
    await updateQuantity(delta);
    
    message.success(
      `Successfully ${modalAction.value === 'increase' ? 'added' : 'removed'} ${quantityChange.value} pieces`
    );
    
    isModalVisible.value = false;
    quantityChange.value = 1;
    comentario.value = '';
  } catch (error) {
    message.error('Failed to update inventory');
    console.error('Error updating quantity:', error);
  }
};

// Llama al método del store para actualizar el campo `model`
const updateQuantity = async (delta) => {
  await toolsStore.updatePartModel(articulo.value.id, delta);
};
</script>

<style scoped>
/* Container */
.part-details-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding-bottom: 100px; /* Space for mobile navigation */
}

/* Header Section */
.header-section {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 20px;
}

.back-btn {
  font-size: 16px;
  color: #667eea;
  transition: all 0.3s ease;
}

.back-btn:hover {
  color: #764ba2;
  transform: translateX(-2px);
}

.page-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
}

.title-icon {
  font-size: 28px;
  color: #667eea;
}

.page-title h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Content Wrapper */
.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Overview Card */
.overview-card {
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  background: white;
  overflow: hidden;
}

.part-overview {
  display: flex;
  gap: 32px;
  padding: 32px;
}

.part-image-section {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.image-container {
  position: relative;
}

.part-image {
  border: 4px solid #f0f2f5;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.part-image:hover {
  transform: scale(1.05);
  border-color: #667eea;
}

.default-image {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 48px;
}

.image-gallery {
  display: flex;
  gap: 8px;
  align-items: center;
}

.gallery-item {
  transition: transform 0.3s ease;
}

.gallery-item:hover {
  transform: scale(1.1);
}

.more-images {
  background: #f0f2f5;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: #666;
}

/* Part Info Section */
.part-info-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.part-header {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.part-name {
  margin: 0;
  font-size: 32px;
  font-weight: 600;
  color: #1f2937;
}

.part-id-tag {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 8px;
}

.part-description {
  font-size: 16px;
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
}

/* Quick Stats */
.quick-stats {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: #f8fafc;
  border-radius: 12px;
  border-left: 4px solid;
  min-width: 200px;
}

.quantity-stat {
  border-left-color: #10b981;
}

.location-stat {
  border-left-color: #f59e0b;
}

.machine-stat {
  border-left-color: #6366f1;
}

.stat-icon {
  font-size: 24px;
  color: #374151;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

/* Actions Card */
.actions-card {
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  background: white;
}

.actions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 24px 24px 0;
}

.actions-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}

.current-quantity {
  display: flex;
  align-items: center;
  gap: 8px;
}

.quantity-label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.quantity-tag {
  font-weight: 600;
  font-size: 14px;
  padding: 6px 12px;
  border-radius: 8px;
}

.action-buttons {
  display: flex;
  gap: 16px;
  padding: 0 24px 24px;
}

.decrease-btn,
.increase-btn {
  flex: 1;
  height: 48px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s ease;
}

.decrease-btn {
  border: 2px solid #ef4444;
  color: #ef4444;
  background: white;
}

.decrease-btn:hover:not(:disabled) {
  background: #ef4444;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.increase-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
}

.increase-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

/* Details Card */
.details-card {
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  background: white;
}

.details-header {
  padding: 24px 24px 0;
  margin-bottom: 24px;
}

.details-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}

.details-grid {
  padding: 0 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px 0;
  border-bottom: 1px solid #f0f2f5;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: #374151;
  min-width: 150px;
}

.detail-icon {
  font-size: 16px;
  color: #667eea;
}

.detail-value {
  color: #6b7280;
  text-align: right;
  max-width: 60%;
  word-break: break-word;
}

.description-text {
  max-width: 100%;
  text-align: left;
}

.detail-quantity-tag {
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 6px;
}

/* Empty State */
.empty-state {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.empty-card {
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
}

.empty-message {
  font-size: 16px;
  color: #6b7280;
  margin: 16px 0;
}

.empty-back-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  font-weight: 600;
  height: 40px;
  border-radius: 8px;
}

/* Modal Styles */
.modern-modal .ant-modal-content {
  border-radius: 16px;
  overflow: hidden;
}

.modal-content {
  padding: 8px 0;
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding: 0 8px;
}

.modal-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
}

.modal-info h4 {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.modal-info p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.modal-form {
  padding: 0 8px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .part-details-container {
    padding-bottom: 120px;
  }

  .header-content {
    padding: 16px 20px;
  }

  .page-title h1 {
    font-size: 24px;
  }

  .content-wrapper {
    padding: 16px;
    gap: 16px;
  }

  .part-overview {
    flex-direction: column;
    text-align: center;
    padding: 24px;
    gap: 24px;
  }

  .part-name {
    font-size: 24px;
  }

  .quick-stats {
    justify-content: center;
  }

  .stat-item {
    min-width: auto;
    flex: 1;
  }

  .actions-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .action-buttons {
    flex-direction: column;
  }

  .detail-row {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }

  .detail-value {
    text-align: left;
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .page-title h1 {
    font-size: 20px;
  }

  .part-name {
    font-size: 20px;
  }

  .quick-stats {
    flex-direction: column;
  }

  .stat-item {
    min-width: 100%;
  }
}
</style>
