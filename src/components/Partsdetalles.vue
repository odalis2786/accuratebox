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
        <div class="header-actions">
          <a-button v-if="!isEditMode" type="primary" @click="enterEditMode" class="edit-button">
            <EditOutlined />Edit
          </a-button>
          <template v-else>
            <a-button type="primary" @click="saveChanges" :disabled="!hasChanges" class="save-button">
              <SaveOutlined />Save
            </a-button>
            <a-button @click="cancelEdit" class="cancel-button">
              <CloseOutlined />Cancel
            </a-button>
          </template>
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
                v-if="(isEditMode ? editableFields.imageUrls : articulo.imageUrls) && (isEditMode ? editableFields.imageUrls : articulo.imageUrls).length" 
                :src="isEditMode ? editableFields.imageUrls[0] : articulo.imageUrls[0]" 
                :size="120"
                class="part-image clickable-image"
                @click="!isEditMode && openImageModal(articulo.imageUrls[0], 0)"
              />
              <a-avatar 
                v-else 
                :size="120"
                class="part-image default-image"
              >
                <BoxPlotOutlined />
              </a-avatar>
              <div v-if="articulo.imageUrls && articulo.imageUrls.length && !isEditMode" class="zoom-indicator">
                <EyeOutlined />
              </div>
              <div v-if="isEditMode" class="image-edit-overlay">
                <a-button 
                  type="primary" 
                  shape="circle" 
                  @click="triggerImageUpload"
                  class="image-edit-button"
                >
                  <CameraOutlined />
                </a-button>
              </div>
              <input 
                ref="imageUploadInput"
                type="file"
                accept="image/*"
                @change="handleImageUpload"
                style="display: none"
              />
            </div>
            <div class="image-gallery" v-if="articulo.imageUrls && articulo.imageUrls.length > 1">
              <div class="gallery-item" v-for="(image, index) in articulo.imageUrls.slice(1, 4)" :key="index">
                <a-avatar 
                  :src="image" 
                  :size="40" 
                  class="gallery-thumbnail"
                  @click="openImageModal(image, index + 1)"
                />
              </div>
              <div 
                v-if="articulo.imageUrls.length > 4" 
                class="more-images clickable-more"
                @click="showAllImages"
              >
                +{{ articulo.imageUrls.length - 4 }}
              </div>
            </div>
          </div>
          
          <div class="part-info-section">
            <div class="part-header">
              <template v-if="!isEditMode">
                <h2 class="part-name">{{ articulo.name || 'Unknown Part' }}</h2>
              </template>
              <template v-else>
                <a-input 
                  v-model:value="editableFields.name"
                  @change="onFieldChange"
                  placeholder="Part name"
                  class="editable-name"
                  size="large"
                />
              </template>
            </div>
            
            <template v-if="!isEditMode">
              <p class="part-description">
                {{ articulo.desc || 'No description available' }}
              </p>
            </template>
            <template v-else>
              <a-textarea 
                v-model:value="editableFields.desc"
                @change="onFieldChange"
                placeholder="Part description"
                class="editable-description"
                :rows="3"
              />
            </template>
            
            <div class="quick-stats">
              <div class="stat-item quantity-stat">
                <div class="stat-icon">
                  <NumberOutlined />
                </div>
                <div class="stat-info">
                  <div class="stat-label">Current Stock</div>
                  <div class="stat-value">{{ getPartQuantity(articulo) }} pieces</div>
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
              :color="getQuantityColor(getPartQuantity(articulo))"
              class="quantity-tag"
            >
              {{ getPartQuantity(articulo) }} pcs
            </a-tag>
          </div>
        </div>
        
        <div class="action-buttons">
          <a-button
            type="default"
            size="large"
            class="decrease-btn"
            @click="showModal('decrease')"
            :disabled="getPartQuantity(articulo) <= 0"
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
              <TagOutlined class="detail-icon" />
              Part Name
            </div>
            <div class="detail-value">
              <template v-if="!isEditMode">
                {{ articulo.name || 'N/A' }}
              </template>
              <a-input 
                v-else
                v-model:value="editableFields.name"
                @change="onFieldChange"
                placeholder="Enter part name"
                class="editable-field"
              />
            </div>
          </div>
          
          <div class="detail-row">
            <div class="detail-label">
              <EnvironmentOutlined class="detail-icon" />
              Location
            </div>
            <div class="detail-value">
              <template v-if="!isEditMode">
                {{ articulo.location || 'Not specified' }}
              </template>
              <a-input 
                v-else
                v-model:value="editableFields.location"
                @change="onFieldChange"
                placeholder="Enter location"
                class="editable-field"
              />
            </div>
          </div>
          
          <div class="detail-row">
            <div class="detail-label">
              <FileTextOutlined class="detail-icon" />
              Description
            </div>
            <div class="detail-value">
              <template v-if="!isEditMode">
                <span class="description-text">{{ articulo.desc || 'No description available' }}</span>
              </template>
              <a-textarea 
                v-else
                v-model:value="editableFields.desc"
                @change="onFieldChange"
                placeholder="Enter description"
                class="editable-field"
                :rows="2"
              />
            </div>
          </div>
          
          <div class="detail-row">
            <div class="detail-label">
              <SettingOutlined class="detail-icon" />
              Machine
            </div>
            <div class="detail-value">
              <template v-if="!isEditMode">
                {{ articulo.machine || 'General' }}
              </template>
              <a-input 
                v-else
                v-model:value="editableFields.machine"
                @change="onFieldChange"
                placeholder="Enter machine name"
                class="editable-field"
              />
            </div>
          </div>
          
          <div class="detail-row">
            <div class="detail-label">
              <NumberOutlined class="detail-icon" />
              Quantity
            </div>
            <div class="detail-value">
              <a-tag 
                :color="getQuantityColor(getPartQuantity(articulo))"
                class="detail-quantity-tag"
              >
                {{ getPartQuantity(articulo) }} pieces
              </a-tag>
            </div>
          </div>
        </div>
      </a-card>
    </div>
  </div>

 













  <!-- Empty State - Only show if we're not navigating back -->
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
              :max="modalAction === 'decrease' ? getPartQuantity(articulo) : 9999"
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

  <!-- Image Modal -->
  <a-modal
    v-model:visible="imageModalVisible"
    :title="null"
    :footer="null"
    :width="800"
    class="image-modal"
    centered
  >
    <div class="image-modal-content">
      <div class="image-header">
        <h3>{{ articulo?.name || 'Part Image' }}</h3>
        <div class="image-counter" v-if="articulo?.imageUrls?.length > 1">
          {{ currentImageIndex + 1 }} / {{ articulo.imageUrls.length }}
        </div>
      </div>
      
      <div class="image-viewer">
        <div class="image-container-modal">
          <img 
            :src="currentImage" 
            :alt="articulo?.name || 'Part image'"
            class="modal-image"
            @load="onImageLoad"
            @error="onImageError"
          />
          <div v-if="imageLoading" class="image-loading">
            <a-spin size="large" />
          </div>
        </div>
        
        <!-- Navigation arrows for multiple images -->
        <div v-if="articulo?.imageUrls?.length > 1" class="image-navigation">
          <a-button 
            type="text" 
            class="nav-btn prev-btn"
            @click="previousImage"
            :disabled="currentImageIndex === 0"
          >
            <LeftOutlined />
          </a-button>
          
          <a-button 
            type="text" 
            class="nav-btn next-btn"
            @click="nextImage"
            :disabled="currentImageIndex === articulo.imageUrls.length - 1"
          >
            <RightOutlined />
          </a-button>
        </div>
      </div>
      
      <!-- Thumbnail strip for multiple images -->
      <div v-if="articulo?.imageUrls?.length > 1" class="thumbnail-strip">
        <div 
          v-for="(image, index) in articulo.imageUrls" 
          :key="index"
          class="thumbnail-item"
          :class="{ active: index === currentImageIndex }"
          @click="goToImage(index)"
        >
          <img :src="image" :alt="`Image ${index + 1}`" class="thumbnail-image" />
        </div>
      </div>
      
      <div class="image-actions">
        <a-button type="primary" @click="downloadImage" class="download-btn">
          <DownloadOutlined /> Download
        </a-button>
        <a-button @click="closeImageModal" class="close-btn">
          Close
        </a-button>
      </div>
    </div>
  </a-modal>

  <!-- All Images Modal -->
  <a-modal
    v-model:visible="allImagesModalVisible"
    title="All Images"
    :footer="null"
    :width="1000"
    class="all-images-modal"
  >
    <div class="all-images-grid">
      <div 
        v-for="(image, index) in articulo?.imageUrls || []" 
        :key="index"
        class="grid-image-item"
        @click="openImageModal(image, index)"
      >
        <img :src="image" :alt="`Image ${index + 1}`" class="grid-image" />
        <div class="grid-image-overlay">
          <EyeOutlined />
        </div>
      </div>
    </div>
  </a-modal>

  <!-- Modern Mobile Navigation Bar -->
  <div v-if="!isLargeScreen" class="mobile-nav-container">
    <!-- Main Navigation -->
    <div class="modern-floating-menu">
      <div class="nav-item" @click="goBack" :class="{ active: false }">
        <div class="nav-icon">
          <ArrowLeftOutlined />
        </div>
        <span class="nav-label">Back</span>
      </div>
      
      <div class="nav-item" @click="handleMenu('5')" :class="{ active: false }">
        <div class="nav-icon">
          <PlusOutlined />
        </div>
        <span class="nav-label">Add Parts</span>
      </div>
      
      <div class="nav-item center-item" @click="handleMenu('6')" :class="{ active: true }">
        <div class="nav-icon-center">
          <BoxPlotOutlined />
        </div>
      </div>
      
      <div class="nav-item" @click="toggleSubMenu('more')" :class="{ active: currentSubMenu === 'more' }">
        <div class="nav-icon">
          <MoreOutlined />
        </div>
        <span class="nav-label">More</span>
      </div>
      
      <div class="nav-item" @click="LogoOut()" :class="{ active: false }">
        <div class="nav-icon">
          <LogoutOutlined />
        </div>
        <span class="nav-label">Logout</span>
      </div>
    </div>
    
    <!-- Expanded Menu -->
    <div v-if="currentSubMenu === 'more'" class="modern-submenu">
      <div class="submenu-content">
        <div class="submenu-item" @click="toggleSubMenu('machines')" v-if="currentSubMenu !== 'machines'">
          <DesktopOutlined />
          <span>Machines</span>
        </div>
        <!-- Machine Options -->
        <div v-if="currentSubMenu === 'machines'" class="machines-submenu">
          <div class="submenu-item" @click="handleMenu('13')" v-if="userStore.userData.position === 'Admin'">
            <PlusOutlined />
            <span>Add Machine</span>
          </div>
          <div class="submenu-item" @click="handleMenu('14')">
            <MinusOutlined />
            <span>Delete Machine</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from "vue";
import { useUserStore } from "@/stores/user.js";
import { useMenuStore } from "@/stores/menus.js";
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
  EyeOutlined,
  LeftOutlined,
  RightOutlined,
  DownloadOutlined,
  ShopOutlined,
  LogoutOutlined,
  MoreOutlined,
  ToolOutlined,
  DesktopOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  CheckOutlined,
  CameraOutlined,
  UploadOutlined,
} from "@ant-design/icons-vue";

const toolsStore = useUserStore();
const userStore = useUserStore(); // Para validar permisos
const router = useRouter();
const isModalVisible = ref(false);
const modalAction = ref('increase');
const quantityChange = ref(1);
const comentario = ref('');
const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE;

// Image modal variables
const imageModalVisible = ref(false);
const allImagesModalVisible = ref(false);
const currentImage = ref('');
const currentImageIndex = ref(0);
const imageLoading = ref(false);

// Responsive design
const isLargeScreen = ref(window.innerWidth > 768);

const updateScreenSize = () => {
  isLargeScreen.value = window.innerWidth > 768;
};

// Navigation state (same as home.vue)
const currentSubMenu = ref(null);

// Edit mode state
const isEditMode = ref(false);
const editableFields = ref({
  name: '',
  desc: '',
  location: '',
  machine: ''
});

// Track if changes were made
const hasChanges = ref(false);

// Recupera la parte seleccionada desde el store
const articulo = computed(() => {
  const part = toolsStore.PartsSeleccionado;
  if (part) {
    console.log("Part data in PartsDetalles:", part);
    console.log("Part model field:", part.model);
    console.log("Part cuantiti field:", part.cuantiti);
  }
  return part;
});

// Modal title based on action
const modalTitle = computed(() => {
  return modalAction.value === 'increase' ? 'Add Stock to Inventory' : 'Remove Stock from Inventory';
});

// Helper function to get quantity from part (handles both model and cuantiti fields)
const getPartQuantity = (part) => {
  if (!part) return 0;
  // Prioritize 'model' field, fallback to 'cuantiti' for backwards compatibility
  return part.model !== undefined ? part.model : (part.cuantiti || 0);
};

// Color function for quantity
const getQuantityColor = (quantity) => {
  const qty = parseInt(quantity) || 0;
  if (qty === 0) return 'red';
  if (qty <= 5) return 'orange';
  if (qty <= 20) return 'blue';
  return 'green';
};

// Redirige al usuario a PartsView
const goBack = () => {
  console.log('goBack function called - navigating to Parts View using router');
  // Clear the selected part when going back
  toolsStore.PartsSeleccionado = null;
  // Navigate to home with Parts View active
  router.push({ path: '/home', query: { activeBreadcrumb: 'Parts View', menuKey: '6' } });
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

// Edit mode functions
const enterEditMode = () => {
  isEditMode.value = true;
  editableFields.value = {
    name: articulo.value.name || '',
    desc: articulo.value.desc || '',
    location: articulo.value.location || '',
    machine: articulo.value.machine || '',
    imageUrls: articulo.value.imageUrls ? [...articulo.value.imageUrls] : []
  };
  hasChanges.value = false;
};

const cancelEdit = () => {
  if (hasChanges.value) {
    Modal.confirm({
      title: 'Discard Changes?',
      content: 'You have unsaved changes. Are you sure you want to discard them?',
      okText: 'Discard',
      okType: 'danger',
      cancelText: 'Continue Editing',
      onOk() {
        isEditMode.value = false;
        hasChanges.value = false;
      }
    });
  } else {
    isEditMode.value = false;
    hasChanges.value = false;
  }
};

const saveChanges = async () => {
  try {
    await toolsStore.updatePartFields(articulo.value.id, editableFields.value);
    
    message.success('Part details updated successfully');
    isEditMode.value = false;
    hasChanges.value = false;
    
    // Refresh the part data
    await toolsStore.fetchParts();
  } catch (error) {
    console.error('Error updating part:', error);
    message.error('Failed to update part details');
  }
};

// Track changes in editable fields
const onFieldChange = () => {
  hasChanges.value = true;
};

// Image upload functions
const imageUploadInput = ref(null);

const triggerImageUpload = () => {
  imageUploadInput.value?.click();
};

const handleImageUpload = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  // Validate file type
  if (!file.type.startsWith('image/')) {
    message.error('Please select a valid image file');
    return;
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    message.error('Image size should be less than 5MB');
    return;
  }

  try {
    message.loading({ content: 'Uploading image...', key: 'imageUpload' });

    // Convert file to base64 or handle upload to Firebase Storage
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageDataUrl = e.target.result;
      
      // Update the editable fields with the new image
      if (!editableFields.value.imageUrls) {
        editableFields.value.imageUrls = [];
      }
      
      // Replace the first image or add new one
      if (editableFields.value.imageUrls.length > 0) {
        editableFields.value.imageUrls[0] = imageDataUrl;
      } else {
        editableFields.value.imageUrls.push(imageDataUrl);
      }
      
      onFieldChange();
      message.success({ content: 'Image uploaded successfully', key: 'imageUpload' });
    };
    
    reader.onerror = () => {
      message.error({ content: 'Failed to upload image', key: 'imageUpload' });
    };
    
    reader.readAsDataURL(file);
  } catch (error) {
    console.error('Error uploading image:', error);
    message.error({ content: 'Failed to upload image', key: 'imageUpload' });
  }

  // Reset the input
  event.target.value = '';
};

// Image modal functions
const openImageModal = (imageUrl, index) => {
  currentImage.value = imageUrl;
  currentImageIndex.value = index;
  imageModalVisible.value = true;
  imageLoading.value = true;
  allImagesModalVisible.value = false; // Close all images modal if open
};

const closeImageModal = () => {
  imageModalVisible.value = false;
  currentImage.value = '';
  currentImageIndex.value = 0;
  imageLoading.value = false;
};

const nextImage = () => {
  if (articulo.value?.imageUrls && currentImageIndex.value < articulo.value.imageUrls.length - 1) {
    currentImageIndex.value++;
    currentImage.value = articulo.value.imageUrls[currentImageIndex.value];
    imageLoading.value = true;
  }
};

const previousImage = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--;
    currentImage.value = articulo.value.imageUrls[currentImageIndex.value];
    imageLoading.value = true;
  }
};

const goToImage = (index) => {
  currentImageIndex.value = index;
  currentImage.value = articulo.value.imageUrls[index];
  imageLoading.value = true;
};

const onImageLoad = () => {
  imageLoading.value = false;
};

const onImageError = () => {
  imageLoading.value = false;
  message.error('Failed to load image');
};

const downloadImage = () => {
  if (currentImage.value) {
    const link = document.createElement('a');
    link.href = currentImage.value;
    link.download = `${articulo.value?.name || 'part'}_image_${currentImageIndex.value + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success('Image download started');
  }
};

const showAllImages = () => {
  allImagesModalVisible.value = true;
};

// Navigation functions (same as home.vue)
const toggleSubMenu = (menu) => {
  if (menu === 'machines' && currentSubMenu.value === 'more') {
    // Si estamos en el menú 'more' y hacemos clic en 'machines', mostramos las opciones de máquinas
    currentSubMenu.value = 'machines';
  } else if (currentSubMenu.value === menu) {
    // Si el menú actual es el mismo, lo cerramos
    currentSubMenu.value = null;
  } else {
    // Abrimos el nuevo menú
    currentSubMenu.value = menu;
  }
};

// Breadcrumbs (copied from home.vue)
const breadcrumbs = ref([{ name: "Home", key: "home" }]);

const breadcrumbNames = {
  1: "Settings",
  2: "Rfid Entry",
  3: "Tools Entry",
  4: "Tools View",
  5: "Parts Entry",
  6: "Parts View",
  7: "Work Entry",
  8: "Work View",
  9: "Work Completed",
  10: "Create Task",
  11: "Mechanic Work View",
  12: "Mechanic Work Completed",
  13: "Add Machines",
  14: "Delete Machines",
  15: "Edit Machines",
  16: "View Machines",
  17: "CoolRoom",
  18: "Fans",
};

const updateBreadcrumbs = (breadcrumb) => {
  breadcrumbs.value = [
    { name: "Home", key: "home" },
    { name: breadcrumb, key: breadcrumb },
  ];
};

const handleMenu = (key) => {
  updateBreadcrumbs(breadcrumbNames[key]);
  const menuStore = useMenuStore();
  menuStore.selectedKey = "";
  console.log("Handle menu llamado", key);
  
  // Clear the selected part when navigating away
  toolsStore.PartsSeleccionado = null;
  
  // Close submenu after selection
  currentSubMenu.value = null;

  // Use the exact same logic as home.vue
  switch (key) {
    case "1":
      // This won't work in this component, but we'll keep the structure
      break;
    case "2":
      // Entry component
      break;
    case "3":
      // Tools component
      break;
    case "4":
      // ToolsView component
      break;
    case "5":
      // Navigate to PartsEntry using router
      console.log('Navigating to Parts Entry using router');
      toolsStore.PartsSeleccionado = null;
      router.push({ path: '/home', query: { activeBreadcrumb: 'Parts Entry', menuKey: '5' } });
      break;
    case "6":
      // Navigate to PartsView using router
      console.log('Navigating to Parts View using router');
      toolsStore.PartsSeleccionado = null;
      router.push({ path: '/home', query: { activeBreadcrumb: 'Parts View', menuKey: '6' } });
      break;
    case "7":
      // WorkEntry component
      break;
    default:
      // For any other case, try to trigger parent navigation
      console.log('Sending postMessage for key:', key);
      window.postMessage({ type: 'navigate', key: key }, '*');
      break;
  }
};

const LogoOut = () => {
  toolsStore.logoutUser();
};

// Lifecycle hooks
onMounted(() => {
  window.addEventListener('resize', updateScreenSize);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateScreenSize);
});
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
  justify-content: space-between;
  gap: 20px;
}

.header-actions {
  display: flex;
  gap: 12px;
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

.edit-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  font-weight: 500;
  height: 40px;
  padding: 0 16px;
  transition: all 0.3s ease;
}

.edit-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.save-button {
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
  border: none;
  border-radius: 8px;
  font-weight: 500;
  height: 40px;
  padding: 0 16px;
  transition: all 0.3s ease;
}

.save-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(82, 196, 26, 0.3);
}

.save-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cancel-button {
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  font-weight: 500;
  height: 40px;
  padding: 0 16px;
  transition: all 0.3s ease;
}

.cancel-button:hover {
  border-color: #ff4d4f;
  color: #ff4d4f;
  transform: translateY(-2px);
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

.image-edit-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
}

.image-container:hover .image-edit-overlay {
  opacity: 1;
}

.image-edit-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.image-edit-button:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.clickable-image {
  cursor: pointer;
}

.clickable-image:hover {
  transform: scale(1.05);
  border-color: #667eea;
}

.default-image {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 48px;
}

.zoom-indicator {
  position: absolute;
  top: -8px;
  right: -8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.part-image:hover + .zoom-indicator,
.zoom-indicator:hover {
  opacity: 1;
}

.image-gallery {
  display: flex;
  gap: 8px;
  align-items: center;
}

.gallery-item {
  transition: transform 0.3s ease;
}

.gallery-thumbnail {
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.gallery-thumbnail:hover {
  transform: scale(1.1);
  border-color: #667eea;
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
  transition: all 0.3s ease;
}

.clickable-more {
  cursor: pointer;
}

.clickable-more:hover {
  background: #667eea;
  color: white;
  transform: scale(1.1);
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

.editable-name {
  font-size: 32px;
  font-weight: 600;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  margin-bottom: 12px;
}

.editable-name:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.editable-description {
  font-size: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  margin: 16px 0 24px 0;
}

.editable-description:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.editable-field {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.editable-field:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
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

/* Image Modal Styles */
.image-modal .ant-modal-content {
  border-radius: 16px;
  overflow: hidden;
  padding: 0;
}

.image-modal .ant-modal-body {
  padding: 0;
}

.image-modal-content {
  display: flex;
  flex-direction: column;
}

.image-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f2f5;
  background: #fafbfc;
}

.image-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.image-counter {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.image-viewer {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
  min-height: 400px;
}

.image-container-modal {
  position: relative;
  max-width: 100%;
  max-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-image {
  max-width: 100%;
  max-height: 60vh;
  object-fit: contain;
  border-radius: 8px;
}

.image-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.8);
  border-radius: 8px;
  padding: 20px;
}

.image-navigation {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0 20px;
  pointer-events: none;
}

.nav-btn {
  pointer-events: all;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: all 0.3s ease;
}

.nav-btn:hover:not(:disabled) {
  background: rgba(102, 126, 234, 0.8);
  transform: scale(1.1);
}

.nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.thumbnail-strip {
  display: flex;
  gap: 8px;
  padding: 16px 24px;
  background: #fafbfc;
  border-top: 1px solid #f0f2f5;
  overflow-x: auto;
  max-height: 80px;
}

.thumbnail-item {
  flex-shrink: 0;
  cursor: pointer;
  border: 2px solid transparent;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.thumbnail-item.active {
  border-color: #667eea;
  transform: scale(1.1);
}

.thumbnail-item:hover {
  border-color: #764ba2;
  transform: scale(1.05);
}

.thumbnail-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  display: block;
}

.image-actions {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #f0f2f5;
  background: #fafbfc;
  justify-content: flex-end;
}

.download-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  font-weight: 600;
}

.close-btn {
  border: 1px solid #d1d5db;
  background: white;
}

/* All Images Modal */
.all-images-modal .ant-modal-content {
  border-radius: 16px;
}

.all-images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  padding: 16px 0;
}

.grid-image-item {
  position: relative;
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
  aspect-ratio: 1;
  transition: transform 0.3s ease;
}

.grid-image-item:hover {
  transform: scale(1.05);
}

.grid-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.grid-image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.grid-image-item:hover .grid-image-overlay {
  opacity: 1;
}

/* Mobile responsiveness for image modals */
@media (max-width: 768px) {
  .image-modal .ant-modal {
    margin: 16px;
    max-width: calc(100vw - 32px);
  }
  
  .modal-image {
    max-height: 50vh;
  }
  
  .image-header {
    padding: 16px 20px;
  }
  
  .image-header h3 {
    font-size: 16px;
  }
  
  .thumbnail-strip {
    padding: 12px 20px;
  }
  
  .thumbnail-image {
    width: 50px;
    height: 50px;
  }
  
  .image-actions {
    padding: 16px 20px;
  }
  
  .all-images-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
  }
  
  .nav-btn {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .all-images-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 8px;
  }
  
  .thumbnail-image {
    width: 40px;
    height: 40px;
  }
}

/* Modern Mobile Navigation Bar */
.mobile-nav-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 9999;
}

.modern-floating-menu {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  backdrop-filter: blur(20px);
  border-radius: 25px 25px 0 0;
  padding: 15px 20px 25px;
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  box-shadow: 0 -10px 30px rgba(102, 126, 234, 0.3);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
}

.modern-floating-menu::before {
  content: '';
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  padding: 8px 12px;
  border-radius: 20px;
  position: relative;
  min-width: 60px;
}

.nav-item:not(.center-item):hover {
  transform: translateY(-5px) scale(1.1);
  background: rgba(255, 255, 255, 0.15);
}

.nav-item.active:not(.center-item) {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-3px);
}

.nav-icon {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
  margin-bottom: 4px;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.nav-item:hover .nav-icon {
  background: rgba(255, 255, 255, 0.25);
  box-shadow: 0 4px 15px rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.nav-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  text-align: center;
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
}

.nav-item:hover .nav-label {
  color: white;
  transform: scale(1.05);
}

/* Center Item (Special Featured Button) */
.center-item {
  transform: translateY(-20px);
  z-index: 2;
}

.center-item .nav-icon-center {
  width: 65px;
  height: 65px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: white;
  box-shadow: 0 10px 25px rgba(238, 90, 36, 0.4);
  border: 4px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  position: relative;
}

.center-item .nav-icon-center::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff6b6b, #ee5a24, #ff6b6b);
  z-index: -1;
  animation: rotate 3s linear infinite;
}

@keyframes rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.center-item:hover .nav-icon-center {
  transform: scale(1.15) rotate(10deg);
  box-shadow: 0 15px 35px rgba(238, 90, 36, 0.6);
}

.center-item:active .nav-icon-center {
  transform: scale(0.95);
}

/* Modern Submenu */
.modern-submenu {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px 20px 0 0;
  margin-bottom: -1px;
  padding: 20px;
  box-shadow: 0 -5px 20px rgba(0, 0, 0, 0.1);
  animation: slideUp 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.submenu-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 15px;
  max-width: 400px;
  margin: 0 auto;
}

.submenu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px 10px;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #f8f9ff 0%, #e8ecff 100%);
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.submenu-item:hover {
  transform: translateY(-3px) scale(1.05);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.submenu-item span {
  font-size: 12px;
  font-weight: 500;
  margin-top: 8px;
  text-align: center;
  color: #333;
  transition: color 0.3s ease;
}

.submenu-item:hover span {
  color: white;
}

.submenu-item .anticon {
  font-size: 20px;
  color: #667eea;
  transition: all 0.3s ease;
}

.submenu-item:hover .anticon {
  color: white;
  transform: scale(1.2);
}

/* Machines Submenu */
.machines-submenu {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  grid-column: 1 / -1; /* Ocupa todo el ancho del grid */
}

.machines-submenu .submenu-item {
  background: linear-gradient(135deg, #e8f5e8 0%, #d4edda 100%);
  border: 1px solid rgba(40, 167, 69, 0.2);
}

.machines-submenu .submenu-item:hover {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .modern-floating-menu {
    padding: 12px 15px 20px;
  }
  
  .nav-item {
    min-width: 50px;
    padding: 6px 8px;
  }
  
  .nav-icon {
    width: 35px;
    height: 35px;
    font-size: 18px;
  }
  
  .nav-label {
    font-size: 10px;
  }
  
  .center-item .nav-icon-center {
    width: 55px;
    height: 55px;
    font-size: 24px;
  }
  
  .center-item {
    transform: translateY(-15px);
  }
  
  .submenu-content {
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
    gap: 10px;
  }
  
  .submenu-item {
    padding: 12px 8px;
  }
}

/* Add padding to content to account for mobile nav */
@media (max-width: 768px) {
  .part-details-container {
    padding-bottom: 80px;
  }
  
  .empty-state {
    padding-bottom: 80px;
  }
}
</style>
