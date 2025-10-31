<template>
  <div class="parts-view-container">
    <!-- Header Section with Statistics -->
    <div class="parts-header">
      <div class="header-content">
        <div class="header-info">
          <h1 class="page-title">
            <DatabaseOutlined class="title-icon" />
            Parts Inventory
          </h1>
          <p class="page-subtitle">Manage and track all parts in your shop</p>
        </div>
        
        <!-- Statistics Cards -->
        <div class="stats-container">
          <a-row :gutter="16">
            <a-col :xs="24" :sm="8">
              <div class="stat-card total-parts">
                <div class="stat-icon">
                  <InboxOutlined />
                </div>
                <div class="stat-content">
                  <div class="stat-number">{{ totalParts }}</div>
                  <div class="stat-label">Total Parts</div>
                </div>
              </div>
            </a-col>
            
            <a-col :xs="24" :sm="8">
              <div class="stat-card total-quantity">
                <div class="stat-icon">
                  <NumberOutlined />
                </div>
                <div class="stat-content">
                  <div class="stat-number">{{ totalQuantity }}</div>
                  <div class="stat-label">Total Quantity</div>
                </div>
              </div>
            </a-col>
            
            <a-col :xs="24" :sm="8">
              <div class="stat-card unique-locations">
                <div class="stat-icon">
                  <EnvironmentOutlined />
                </div>
                <div class="stat-content">
                  <div class="stat-number">{{ uniqueLocations }}</div>
                  <div class="stat-label">Locations</div>
                </div>
              </div>
            </a-col>
          </a-row>
        </div>
      </div>
    </div>

    <!-- Search and Filter Section -->
    <a-card class="search-card" :bordered="false">
      <a-row :gutter="16" align="middle">
        <a-col :xs="24" :sm="12" :md="8">
          <a-input-search
            v-model:value="searchText"
            placeholder="Search parts by name, location, or machine..."
            size="large"
            @search="handleSearch"
            class="search-input"
          >
            <template #prefix>
              <SearchOutlined class="search-icon" />
            </template>
          </a-input-search>
        </a-col>
        
        <a-col :xs="24" :sm="12" :md="6">
          <a-select
            v-model:value="selectedLocation"
            placeholder="Filter by location"
            size="large"
            class="filter-select"
            :options="locationOptions"
            @change="handleLocationFilter"
          >
            <template #suffixIcon>
              <FilterOutlined />
            </template>
          </a-select>
        </a-col>
        
        <a-col :xs="0" :sm="0" :md="4">
          <a-button 
            type="primary" 
            size="large" 
            @click="exportToExcel"
            :loading="exportingExcel"
            :disabled="exportBlocked"
            class="export-button desktop-only"
          >
            <DownloadOutlined />
            {{ exportBlocked ? 'Please wait...' : 'Export Excel' }}
          </a-button>
        </a-col>
        
      </a-row>
    </a-card>

    <!-- Desktop Table View -->
    <a-card class="table-card desktop-only" :bordered="false">
      <a-table 
        :columns="columns" 
        :dataSource="filteredParts" 
        rowKey="id"
        :loading="toolsStore.loadingUser"
        :pagination="{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} parts`,
        }"
        :customRow="(record) => ({
          class: `quantity-row-${getQuantityColor(getPartQuantity(record))}`
        })"
        class="modern-table"
        size="middle"
      >
        <template v-slot:bodyCell="{ column, record }">
          <template v-if="column.key === 'avatar'">
            <div class="avatar-cell">
              <a-avatar
                v-if="record.imageUrls && record.imageUrls.length"
                :src="record.imageUrls[0]"
                :size="50"
                class="part-avatar"
              />
              <a-avatar v-else :size="50" class="part-avatar default-avatar">
                <BoxPlotOutlined />
              </a-avatar>
            </div>
          </template>
          
          <template v-if="column.key === 'name'">
            <div class="name-cell-responsive">
              <!-- First Row: Part Name and Description -->
              <div class="part-info-row">
                <div class="part-name-main">{{ record.name }}</div>
                <div class="part-description-main">{{ record.desc || 'No description available' }}</div>
              </div>
              
              <!-- Second Row: Details (Quantity, Location, Machine) -->
              <div class="part-details-row">
                <div class="detail-item">
                  <AppstoreOutlined class="detail-icon quantity-icon" />
                  <span class="detail-label">Qty:</span>
                  <a-tag 
                    :color="getQuantityColor(getPartQuantity(record))"
                    class="quantity-tag-inline"
                  >
                    {{ getPartQuantity(record) }}
                  </a-tag>
                </div>
                <div class="detail-item">
                  <EnvironmentOutlined class="detail-icon location-icon" />
                  <span class="detail-label">Loc:</span>
                  <span class="detail-value">{{ record.location || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <SettingOutlined class="detail-icon machine-icon" />
                  <span class="detail-label">Machine:</span>
                  <span class="detail-value">{{ record.machine || 'General' }}</span>
                </div>
              </div>
            </div>
          </template>
          
          <template v-if="column.key === 'actions'">
            <a-button 
              type="primary" 
              size="small"
              @click="viewDetails(record)"
              class="action-btn view-btn"
            >
              <EyeOutlined /> View
            </a-button>
          </template>
        </template>
        
        <template #emptyText>
          <a-empty 
            description="No parts found"
            :image="simpleImage"
          >
            <a-button type="primary" @click="addNewPart">
              <PlusOutlined /> Add First Part
            </a-button>
          </a-empty>
        </template>
      </a-table>
    </a-card>

    <!-- Mobile Card View -->
    <div class="mobile-only">
      <div class="mobile-parts-container" v-if="filteredParts.length > 0">
        <div 
          v-for="record in filteredParts" 
          :key="record.id"
          :class="`mobile-part-card quantity-card-${getQuantityColor(getPartQuantity(record))}`"
        >
          <div class="mobile-card-header">
            <div class="mobile-avatar">
              <a-avatar
                v-if="record.imageUrls && record.imageUrls.length"
                :src="record.imageUrls[0]"
                :size="45"
                class="part-avatar"
              />
              <a-avatar v-else :size="45" class="part-avatar default-avatar">
                <BoxPlotOutlined />
              </a-avatar>
            </div>
            <div class="mobile-part-info">
              <div class="mobile-part-name">{{ record.name }}</div>
              <div class="mobile-part-desc">{{ record.desc || 'No description available' }}</div>
            </div>
            <div class="mobile-quantity">
              <a-tag 
                :color="getQuantityColor(getPartQuantity(record))"
                class="mobile-quantity-tag"
              >
                {{ getPartQuantity(record) }}
              </a-tag>
            </div>
          </div>
          
          <div class="mobile-card-details">
            <div class="mobile-detail-item">
              <EnvironmentOutlined class="mobile-detail-icon" />
              <span class="mobile-detail-text">{{ record.location || 'Location not specified' }}</span>
            </div>
            <div class="mobile-detail-item">
              <SettingOutlined class="mobile-detail-icon" />
              <span class="mobile-detail-text">{{ record.machine || 'General use' }}</span>
            </div>
          </div>
          
          <div class="mobile-card-actions">
            <a-button 
              type="primary" 
              @click="viewDetails(record)"
              class="mobile-view-btn"
              block
            >
              <EyeOutlined /> View Details
            </a-button>
          </div>
        </div>
      </div>
      
      <a-empty 
        v-else
        description="No parts found"
        :image="simpleImage"
        class="mobile-empty"
      >
        <a-button type="primary" @click="addNewPart">
          <PlusOutlined /> Add First Part
        </a-button>
      </a-empty>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, computed, ref, watch } from "vue";
import { useUserStore } from "../stores/user.js";
import { useRouter } from "vue-router";
import { message, Empty } from "ant-design-vue";
import * as ExcelJS from 'exceljs';
import {
  UserOutlined,
  DatabaseOutlined,
  InboxOutlined,
  NumberOutlined,
  EnvironmentOutlined,
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  PlusOutlined,
  BoxPlotOutlined,
  EyeOutlined,
  EditOutlined,
  SettingOutlined,
  AppstoreOutlined,
  DownloadOutlined,
  MoreOutlined,
} from "@ant-design/icons-vue";

const toolsStore = useUserStore();
const router = useRouter();
const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE;

// Reactive data
const searchText = ref("");
const selectedLocation = ref(undefined);
const exportingExcel = ref(false);
const exportBlocked = ref(false);

// Table columns
const columns = [
  {
    title: "Part",
    dataIndex: "avatar",
    key: "avatar",
    width: 80,
    align: 'center',
  },
  {
    title: "Part Name & Details",
    dataIndex: "name",
    key: "name",
    ellipsis: false,
    sorter: (a, b) => a.name.localeCompare(b.name),
  },
  {
    title: "Actions",
    key: "actions",
    width: 100,
    align: 'center',
    responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
  },
];

// Computed properties
const parts = computed(() => toolsStore.parts || []);

const totalParts = computed(() => parts.value.length);

const totalQuantity = computed(() => {
  return parts.value.reduce((total, part) => {
    return total + (parseInt(getPartQuantity(part)) || 0);
  }, 0);
});

const uniqueLocations = computed(() => {
  const locations = parts.value
    .map(part => part.location)
    .filter(location => location && location.trim())
    .filter((location, index, array) => array.indexOf(location) === index);
  return locations.length;
});

const locationOptions = computed(() => {
  const locations = parts.value
    .map(part => part.location)
    .filter(location => location && location.trim())
    .filter((location, index, array) => array.indexOf(location) === index)
    .map(location => ({
      label: location,
      value: location,
    }));
  
  return [
    { label: 'All Locations', value: undefined },
    ...locations
  ];
});

const filteredParts = computed(() => {
  let filtered = parts.value;

  // Filter by search text
  if (searchText.value) {
    const search = searchText.value.toLowerCase();
    filtered = filtered.filter(part => 
      (part.name && part.name.toLowerCase().includes(search)) ||
      (part.location && part.location.toLowerCase().includes(search)) ||
      (part.machine && part.machine.toLowerCase().includes(search)) ||
      (part.desc && part.desc.toLowerCase().includes(search))
    );
  }

  // Filter by location
  if (selectedLocation.value) {
    filtered = filtered.filter(part => part.location === selectedLocation.value);
  }

  return filtered;
});

// Methods
// Helper function to get quantity from part (handles both model and cuantiti fields)
const getPartQuantity = (part) => {
  // Prioritize 'model' field, fallback to 'cuantiti' for backwards compatibility
  return part.model !== undefined ? part.model : (part.cuantiti || 0);
};

const getQuantityColor = (quantity) => {
  const qty = parseInt(quantity) || 0;
  if (qty === 0) return 'red';
  if (qty <= 5) return 'orange';
  if (qty <= 20) return 'blue';
  return 'green';
};

const handleSearch = (value) => {
  searchText.value = value;
};

const handleLocationFilter = (value) => {
  selectedLocation.value = value;
};

const refreshData = async () => {
  try {
    await toolsStore.fetchParts();
    message.success('Parts data refreshed successfully');
  } catch (error) {
    message.error('Failed to refresh parts data');
  }
};

const addNewPart = () => {
  // Navigate to add part component
  router.push({ name: 'PartsEntry' }); // Navigate to PartsEntry component
};

const exportToExcel = async () => {
  // Prevent multiple simultaneous exports
  if (exportingExcel.value || exportBlocked.value) {
    message.warning('Export already in progress, please wait...');
    return;
  }

  try {
    exportingExcel.value = true;
    exportBlocked.value = true;
    message.loading({ content: 'Preparing Excel export...', key: 'excel-export' });

    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Parts Inventory');

    // Set worksheet properties
    worksheet.properties.defaultRowHeight = 25;

    // Define columns
    worksheet.columns = [
      { header: 'Part Name', key: 'name', width: 25 },
      { header: 'Description', key: 'description', width: 35 },
      { header: 'Location', key: 'location', width: 20 },
      { header: 'Machine', key: 'machine', width: 20 },
      { header: 'Quantity', key: 'quantity', width: 15 },
      { header: 'Date Added', key: 'dateAdded', width: 20 },
    ];

    // Style the header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '667eea' }
    };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
    headerRow.height = 35;

    // Add data rows
    filteredParts.value.forEach((part, index) => {
      const row = worksheet.addRow({
        name: part.name || 'N/A',
        description: part.desc || 'No description',
        location: part.location || 'Not specified',
        machine: part.machine || 'General',
        quantity: getPartQuantity(part),
        dateAdded: part.createdAt ? new Date(part.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'
      });

      // Style alternating rows
      if (index % 2 === 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'F8F9FA' }
        };
      }

      // Center align quantity column
      row.getCell('quantity').alignment = { horizontal: 'center' };
    });

    // Add borders to all cells
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'E9ECEF' } },
          left: { style: 'thin', color: { argb: 'E9ECEF' } },
          bottom: { style: 'thin', color: { argb: 'E9ECEF' } },
          right: { style: 'thin', color: { argb: 'E9ECEF' } }
        };
      });
    });

    // Add summary at the bottom
    const summaryRowIndex = worksheet.rowCount + 2;
    worksheet.getCell(`A${summaryRowIndex}`).value = 'SUMMARY';
    worksheet.getCell(`A${summaryRowIndex}`).font = { bold: true, size: 12 };
    worksheet.getCell(`A${summaryRowIndex + 1}`).value = `Total Parts: ${totalParts.value}`;
    worksheet.getCell(`A${summaryRowIndex + 2}`).value = `Total Quantity: ${totalQuantity.value}`;
    worksheet.getCell(`A${summaryRowIndex + 3}`).value = `Unique Locations: ${uniqueLocations.value}`;

    // Generate filename with current date
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `Parts_Inventory_${currentDate}.xlsx`;

    // Write to buffer and download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();

    // Cleanup
    window.URL.revokeObjectURL(url);
    
    message.success({ 
      content: `Excel file exported successfully! (${filteredParts.value.length} parts)`, 
      key: 'excel-export' 
    });

  } catch (error) {
    console.error('Error exporting to Excel:', error);
    message.error({ 
      content: 'Failed to export Excel file', 
      key: 'excel-export' 
    });
  } finally {
    exportingExcel.value = false;
    
    // Block button for 3 seconds to prevent multiple downloads
    setTimeout(() => {
      exportBlocked.value = false;
    }, 3000);
  }
};

const viewDetails = (part) => {
  console.log("Original part data:", part);
  console.log("Part model field:", part.model);
  console.log("Part cuantiti field:", part.cuantiti);
  
  toolsStore.seleccionarParts(part);
  console.log("Viewing details for:", part);
  router.push({ name: "detalles" }); // Adjust route name as needed
};

const editPart = (part) => {
  toolsStore.seleccionarParts(part);
  console.log("Editing part:", part);
  // Navigate to edit part component
  router.push({ name: 'editpart', params: { id: part.id } }); // Adjust route name as needed
};

// Lifecycle
onMounted(async () => {
  try {
    // Clear any selected part when returning to PartsView
    toolsStore.PartsSeleccionado = null;
    
    await toolsStore.fetchParts();
    console.log("Parts loaded:", toolsStore.parts);
  } catch (error) {
    message.error('Failed to load parts data');
  }

  // Listen for export messages from navigation
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'exportToExcel') {
      exportToExcel();
    }
  });
});

onUnmounted(() => {
  // Clean up event listener
  window.removeEventListener('message', (event) => {
    if (event.data && event.data.type === 'exportToExcel') {
      exportToExcel();
    }
  });
});

// Watch for changes in parts data to ensure reactivity
watch(() => toolsStore.parts, (newParts) => {
  console.log("Parts data changed:", newParts);
}, { deep: true });

// Watch for changes in parts data to update stats
watch(() => parts.value.length, (newLength) => {
  if (newLength > 0) {
    console.log(`Loaded ${newLength} parts`);
  }
});
</script>

<style scoped>
.parts-view-container {
  padding: 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
  max-width: 1400px;
  margin: 0 auto;
}

/* Header Section */
.parts-header {
  margin-bottom: 24px;
}

.header-content {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
}

.header-info {
  margin-bottom: 32px;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 0 0 8px 0;
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.title-icon {
  font-size: 36px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  margin: 0;
  font-size: 16px;
  color: #64748b;
  font-weight: 500;
}

/* Statistics Cards */
.stats-container {
  margin-top: 24px;
}

.stat-card {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: #667eea;
}

.stat-card.total-parts {
  border-left: 4px solid #3b82f6;
}

.stat-card.total-quantity {
  border-left: 4px solid #10b981;
}

.stat-card.unique-locations {
  border-left: 4px solid #f59e0b;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.total-parts .stat-icon {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
}

.total-quantity .stat-icon {
  background: linear-gradient(135deg, #10b981 0%, #047857 100%);
}

.unique-locations .stat-icon {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
  margin-top: 4px;
}

/* Search and Filter Section */
.search-card {
  margin-bottom: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.search-input {
  border-radius: 8px;
}

.search-icon {
  color: #667eea;
}

.filter-select {
  border-radius: 8px;
}

.export-button {
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
  border: none;
  border-radius: 8px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(82, 196, 26, 0.2);
  transition: all 0.3s ease;
  width: 100%;
}

.export-button:hover:not(.ant-btn-loading):not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(82, 196, 26, 0.3);
}

.export-button:focus {
  box-shadow: 0 0 0 3px rgba(82, 196, 26, 0.2);
}

.export-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: linear-gradient(135deg, #999 0%, #bbb 100%);
  box-shadow: none;
  transform: none;
}

.export-button.desktop-only {
  display: block;
}

.header-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.refresh-btn {
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-weight: 600;
}

.refresh-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.add-part-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.add-part-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

/* Table Section */
.table-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.modern-table {
  border-radius: 8px;
  background: transparent;
  box-shadow: none;
}

.modern-table :deep(.ant-table-container) {
  border-radius: 8px;
  border: none !important;
}

.modern-table :deep(.ant-table-header) {
  background: white;
  border-radius: 8px 8px 0 0;
  border: none !important;
}

.modern-table :deep(.ant-table-body) {
  background: transparent !important;
  border-radius: 0 0 8px 8px;
  border: none !important;
}

.modern-table :deep(.ant-table-thead > tr > th) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white !important;
  font-weight: 600;
  border: none !important;
  position: sticky;
  top: 0;
  z-index: 10;
  text-align: center;
  white-space: nowrap;
  padding: 16px 12px !important;
}

.modern-table :deep(.ant-table-thead > tr > th):before {
  display: none !important;
}

/* Desktop Table: Base row styles - Always active - FORCED REFRESH */
.modern-table :deep(.ant-table-tbody > tr) {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
  border-radius: 12px !important;
  border: 1px solid #e2e8f0 !important;
  margin-bottom: 20px !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
}

.modern-table :deep(.ant-table-tbody > tr > td) {
  border-bottom: none !important;
  vertical-align: middle !important;
  padding: 20px 16px !important;
  border-left: none !important;
  border-right: none !important;
}

.modern-table :deep(.ant-table-tbody > tr > td:first-child) {
  border-top-left-radius: 12px !important;
  border-bottom-left-radius: 12px !important;
  border-left: 4px solid #3b82f6 !important;
}

.modern-table :deep(.ant-table-tbody > tr > td:last-child) {
  border-top-right-radius: 12px !important;
  border-bottom-right-radius: 12px !important;
}

.modern-table :deep(.ant-table-tbody > tr:hover) {
  transform: translateY(-2px) !important;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;
  border-color: #667eea !important;
}

.modern-table :deep(.ant-table-tbody > tr:hover > td:first-child) {
  border-left-color: #667eea !important;
}

/* Desktop Table: Quantity-based row colors - Always active */
.modern-table :deep(.quantity-row-red) {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%) !important;
  border-color: #fca5a5 !important;
}

.modern-table :deep(.quantity-row-red > td:first-child) {
  border-left-color: #ef4444 !important;
}

.modern-table :deep(.quantity-row-red:hover) {
  border-color: #dc2626 !important;
  box-shadow: 0 8px 25px rgba(239, 68, 68, 0.15) !important;
}

.modern-table :deep(.quantity-row-orange) {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%) !important;
  border-color: #fbbf24 !important;
}

.modern-table :deep(.quantity-row-orange > td:first-child) {
  border-left-color: #f59e0b !important;
}

.modern-table :deep(.quantity-row-orange:hover) {
  border-color: #d97706 !important;
  box-shadow: 0 8px 25px rgba(245, 158, 11, 0.15) !important;
}

.modern-table :deep(.quantity-row-blue) {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%) !important;
  border-color: #93c5fd !important;
}

.modern-table :deep(.quantity-row-blue > td:first-child) {
  border-left-color: #3b82f6 !important;
}

.modern-table :deep(.quantity-row-blue:hover) {
  border-color: #2563eb !important;
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15) !important;
}

.modern-table :deep(.quantity-row-green) {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%) !important;
  border-color: #86efac !important;
}

.modern-table :deep(.quantity-row-green > td:first-child) {
  border-left-color: #10b981 !important;
}

.modern-table :deep(.quantity-row-green:hover) {
  border-color: #059669 !important;
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.15) !important;
}

/* Desktop Table: Container and spacing - Always active */
.modern-table :deep(.ant-table-tbody) {
  border-spacing: 0 12px !important;
}

.modern-table :deep(.ant-table-container) {
  border: none !important;
}

.modern-table :deep(.ant-table-tbody > tr:nth-child(even)) {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
}

/* Mobile specific table spacing */
@media (max-width: 768px) {
  .modern-table :deep(.ant-table-tbody) {
    border-spacing: 0 8px !important;
  }
  
  .modern-table :deep(.ant-table-tbody > tr) {
    margin-bottom: 8px !important;
  }
}



/* Table Cell Styles */
.avatar-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.part-avatar {
  border: 3px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.part-avatar:hover {
  transform: scale(1.05);
  border-color: #667eea;
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.2);
}

.default-avatar {
  background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
}

.name-cell {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 0;
}

.part-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 15px;
  line-height: 1.4;
  margin: 0;
}

.part-description {
  color: #6b7280;
  font-size: 12px;
  line-height: 1.3;
  max-width: 280px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  white-space: normal;
}

/* Responsive cell styles for parts */
.name-cell-responsive {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 8px;
  width: 100%;
  max-width: none;
}

.part-info-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.part-name-main {
  font-weight: 600;
  color: #1f2937;
  font-size: 15px;
  line-height: 1.3;
  margin: 0;
  word-break: break-word;
}

.part-description-main {
  color: #6b7280;
  font-size: 12px;
  line-height: 1.4;
  margin: 0;
  word-break: break-word;
  white-space: normal;
  display: block;
}

.part-details-row {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid #e5e7eb;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6b7280;
  padding: 4px 0;
}

.detail-icon {
  font-size: 14px;
  flex-shrink: 0;
}

.quantity-icon {
  color: #10b981;
}

.location-icon {
  color: #f59e0b;
}

.machine-icon {
  color: #6366f1;
}

.detail-label {
  font-weight: 500;
  color: #374151;
  flex-shrink: 0;
}

.detail-value {
  color: #6b7280;
  font-weight: 400;
  word-break: break-word;
}

.quantity-tag-inline {
  font-weight: 600;
  border-radius: 6px;
  padding: 2px 8px;
  font-size: 11px;
  margin: 0;
  flex-shrink: 0;
}

.quantity-tag {
  font-weight: 600;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 13px;
  min-width: 60px;
  text-align: center;
  display: inline-block;
}

.location-cell,
.machine-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #374151;
  font-weight: 500;
}

.location-icon {
  color: #f59e0b;
}

.machine-icon {
  color: #6366f1;
}

.action-btn {
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.view-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border: none;
}

.view-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.edit-btn {
  border: 1px solid #d1d5db;
  color: #374151;
}

.edit-btn:hover {
  border-color: #667eea;
  color: #667eea;
  transform: translateY(-1px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .parts-view-container {
    padding: 16px;
    padding-bottom: 100px; /* Space for bottom navigation */
  }
  
  .header-content {
    padding: 24px 20px;
  }

  .export-button.desktop-only {
    display: none !important;
  }
  
  .page-title {
    font-size: 24px;
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }
  
  .title-icon {
    font-size: 28px;
  }
  
  .stats-container .ant-col {
    margin-bottom: 16px;
  }
  
  .header-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .header-actions .ant-btn {
    width: 100%;
  }
  
  .stat-card {
    padding: 20px 16px;
  }
  
  .stat-number {
    font-size: 24px;
  }

  /* Mobile table adjustments */
  .modern-table :deep(.ant-table-thead > tr > th:first-child) {
    width: 60px !important;
  }
  
  .modern-table :deep(.ant-table-thead > tr > th:last-child) {
    width: 90px !important;
    min-width: 90px !important;
  }
  
  .modern-table :deep(.ant-table-tbody > tr > td) {
    padding: 12px 6px;
    vertical-align: top;
  }
  
  .modern-table :deep(.ant-table-tbody > tr > td:last-child) {
    padding: 12px 8px !important;
    width: 90px !important;
    min-width: 90px !important;
  }
  
  .name-cell-responsive {
    padding: 6px 4px;
    gap: 8px;
  }
  
  .part-name-main {
    font-size: 14px;
    line-height: 1.2;
  }
  
  .part-description-main {
    font-size: 11px;
    line-height: 1.3;
  }
  
  .part-details-row {
    flex-direction: column;
    gap: 4px;
    margin-top: 6px;
    padding-top: 6px;
  }
  
  .detail-item {
    font-size: 10px;
    padding: 2px 0;
    gap: 4px;
  }
  
  .detail-icon {
    font-size: 11px;
  }
  
  .detail-label {
    font-weight: 500;
    min-width: auto;
  }
  
  .quantity-tag-inline {
    font-size: 10px !important;
    padding: 0 6px !important;
    line-height: 18px !important;
  }
  
  /* Mobile button adjustments */
  .action-btn {
    padding: 4px 8px !important;
    font-size: 11px !important;
    height: 28px !important;
    min-width: 70px !important;
  }
  
  .action-btn .anticon {
    font-size: 12px !important;
    margin-right: 4px !important;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 20px;
  }
  
  .stat-icon {
    width: 48px;
    height: 48px;
    font-size: 20px;
  }
  
  .stat-number {
    font-size: 20px;
  }
  
  /* Ultra compact layout for very small screens */
  .name-cell-responsive {
    padding: 4px 2px;
    gap: 6px;
  }
  
  .part-name-main {
    font-size: 13px;
    font-weight: 600;
  }
  
  .part-description-main {
    font-size: 10px;
    color: #9ca3af;
  }
  
  .part-details-row {
    gap: 3px;
    padding-top: 4px;
  }
  
  .detail-item {
    font-size: 9px;
    padding: 1px 0;
  }
  
  .detail-label {
    display: none; /* Hide labels on very small screens */
  }
  
  .detail-value {
    font-size: 9px;
    color: #6b7280;
  }
  
  .quantity-tag-inline {
    font-size: 9px !important;
    padding: 0 4px !important;
    line-height: 16px !important;
  }
  
  .modern-table :deep(.ant-table-tbody > tr > td) {
    padding: 8px 4px !important;
  }
  
  .modern-table :deep(.ant-table-tbody > tr > td:last-child) {
    padding: 8px 6px !important;
    width: 85px !important;
    min-width: 85px !important;
  }
  
  /* Ultra compact button for very small screens */
  .action-btn {
    padding: 3px 6px !important;
    font-size: 10px !important;
    height: 24px !important;
    min-width: 60px !important;
    border-radius: 4px !important;
  }
  
  .action-btn .anticon {
    font-size: 10px !important;
    margin-right: 2px !important;
  }
}

/* Custom scrollbar for table */
.modern-table :deep(.ant-table-body)::-webkit-scrollbar {
  height: 8px;
}

.modern-table :deep(.ant-table-body)::-webkit-scrollbar-track {
  background: #f1f3f4;
  border-radius: 4px;
}

.modern-table :deep(.ant-table-body)::-webkit-scrollbar-thumb {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
}

.modern-table :deep(.ant-table-body)::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(90deg, #5a67d8 0%, #6b46c1 100%);
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

.stat-card {
  animation: fadeInUp 0.5s ease-out;
}

.stat-card:nth-child(1) {
  animation-delay: 0.1s;
}

.stat-card:nth-child(2) {
  animation-delay: 0.2s;
}

.stat-card:nth-child(3) {
  animation-delay: 0.3s;
}

/* Ant Design Overrides */
.modern-table .ant-table-thead > tr > th {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  border-bottom: none !important;
  font-weight: 600;
  color: white !important;
  position: relative;
}

.ant-table-thead > tr > th {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  border-bottom: none !important;
  font-weight: 600;
  color: white !important;
}

.ant-table-tbody > tr:hover > td {
  background: rgba(102, 126, 234, 0.04) !important;
}

.ant-empty-description {
  color: #6b7280;
  font-size: 16px;
}

.ant-pagination-item-active {
  border-color: #667eea;
  background: #667eea;
}

.ant-pagination-item-active a {
  color: white;
}

.ant-select:not(.ant-select-disabled):hover .ant-select-selector,
.ant-input:hover {
  border-color: #667eea;
}

.ant-select-focused .ant-select-selector,
.ant-input:focus {
  border-color: #667eea !important;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2) !important;
}

/* Responsive Design Classes */
.desktop-only {
  display: block;
}

.mobile-only {
  display: none;
}

/* Mobile Parts Cards */
.mobile-parts-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0;
}

.mobile-part-card {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 16px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.mobile-part-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.mobile-card-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.mobile-avatar {
  flex-shrink: 0;
}

.mobile-part-info {
  flex: 1;
  min-width: 0;
}

.mobile-part-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 16px;
  line-height: 1.3;
  margin-bottom: 4px;
  word-break: break-word;
}

.mobile-part-desc {
  color: #6b7280;
  font-size: 13px;
  line-height: 1.4;
  word-break: break-word;
}

.mobile-quantity {
  flex-shrink: 0;
}

.mobile-quantity-tag {
  font-weight: 600;
  font-size: 14px !important;
  padding: 4px 12px !important;
  border-radius: 6px !important;
}

.mobile-card-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
}

.mobile-detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #6b7280;
}

.mobile-detail-icon {
  color: #9ca3af;
  font-size: 14px;
  flex-shrink: 0;
}

.mobile-detail-text {
  flex: 1;
  color: #374151;
  font-weight: 500;
}

.mobile-card-actions {
  margin-top: 8px;
}

.mobile-view-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border: none;
  height: 40px;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.mobile-view-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.mobile-empty {
  margin-top: 40px;
}

/* Quantity-based card colors for mobile */
.quantity-card-red {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border-color: #fca5a5;
  border-left: 4px solid #ef4444;
}

.quantity-card-orange {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border-color: #fbbf24;
  border-left: 4px solid #f59e0b;
}

.quantity-card-blue {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-color: #93c5fd;
  border-left: 4px solid #3b82f6;
}

.quantity-card-green {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-color: #86efac;
  border-left: 4px solid #10b981;
}

/* Mobile Responsive Breakpoints */
@media (max-width: 768px) {
  .desktop-only {
    display: none !important;
  }
  
  .mobile-only {
    display: block !important;
  }
}

@media (max-width: 480px) {
  .mobile-part-card {
    padding: 12px;
  }
  
  .mobile-card-header {
    gap: 10px;
    margin-bottom: 10px;
  }
  
  .mobile-part-name {
    font-size: 15px;
  }
  
  .mobile-part-desc {
    font-size: 12px;
  }
  
  .mobile-detail-item {
    font-size: 12px;
  }
  
  .mobile-view-btn {
    height: 36px;
    font-size: 14px;
  }
}
</style>
