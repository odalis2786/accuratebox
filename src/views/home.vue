<template>
  <div>
    <a-layout :style="{ minHeight: '100vh' }" v-if="isLargeScreen">
      <a-layout-sider
        v-model:collapsed="collapsed"
        collapsible
        :style="{ position: 'fixed', height: '100vh' }"
      >
        <a-row justify="center" class="mb-4">
          <a-avatar
            v-if="userStore.userData.photoUrl"
            :size="50"
            :src="userStore.userData.photoUrl"
          />
          <a-avatar v-else :size="50">
            <template #icon><UserOutlined /></template>
          </a-avatar>
        </a-row>

        <a-menu v-model:selectedKeys="selectedKeys" theme="dark" mode="inline">
        
 


          <a-menu-item
            key="17"
            @click="handleMenu('17')"
            v-if="isMenuItemVisible"
          >
            <SlackOutlined />
            <span>Walk-in Retarder</span>
          </a-menu-item>

          <a-menu-item
            key="18"
            @click="handleMenu('18')"
            v-if="isMenuItemVisible"
          >
          <SlackOutlined />
            <span>Fans</span>
          </a-menu-item>

          <a-sub-menu>
            <template #title>
              <span>
                <ShopOutlined />
                <span>Shop</span>
              </span>
            </template>
           
            <a-menu-item key="5" @click="handleMenu('5')"
              >Parts Entry</a-menu-item
            >
            <a-menu-item key="6" @click="handleMenu('6')"
              >Parts View</a-menu-item
            >
          </a-sub-menu>

          <a-sub-menu
            v-if="
              userStore.userData.position === 'Admin' ||
              userStore.userData.position === 'Mechanic'
            "
          >
            <template #title>
              <span>
                <UnorderedListOutlined />
                <span>Work Order</span>
              </span>
            </template>
            <a-menu-item
              key="7"
              @click="handleMenu('7')"
              v-if="userStore.userData.position === 'Admin'"
            >
              Work Order Entry
            </a-menu-item>
            <a-menu-item key="8" @click="handleMenu('8')"
              >Work Order View</a-menu-item
            >
            <a-menu-item key="9" @click="handleMenu('9')"
              >Work Order completed</a-menu-item
            >
          </a-sub-menu>

          <a-sub-menu
            v-if="
              userStore.userData.position === 'Admin' ||
              userStore.userData.position === 'Mechanic'
            "
          >
            <template #title>
              <span>
                <SaveOutlined />
                <span> Maquinas</span>
              </span>
            </template>
            <a-menu-item
              key="13"
              @click="handleMenu('13')"
              v-if="userStore.userData.position === 'Admin'"
            >
              Add
            </a-menu-item>
            <a-menu-item key="16" @click="handleMenu('16')"> View</a-menu-item>
            <a-menu-item key="14" @click="handleMenu('14')">
              Delete</a-menu-item
            >
            <a-menu-item key="15" @click="handleMenu('15')">
              Edit</a-menu-item
            >
          </a-sub-menu>

          <a-menu-item key="20" @click="LogoOut()">
            <LogoutOutlined />
            <span>Log Out</span>
          </a-menu-item>
        </a-menu>

        
      </a-layout-sider>
      <a-layout style="margin-left: 200px">
        <a-layout-header style="background: #fff; padding: 0" />
        <a-layout-content style="margin: 0 16px; overflow: auto">
          <a-breadcrumb style="margin: 16px 0">
            <a-breadcrumb-item
              v-for="(breadcrumb, index) in breadcrumbs"
              :key="index"
            >
              {{ breadcrumb.name }}
            </a-breadcrumb-item>
          </a-breadcrumb>
          <div
            :style="{ padding: '24px', background: '#fff', minHeight: '360px' }"
          >
            <component :is="selectedComponent" />
          </div>
        </a-layout-content>
        <a-layout-footer style="text-align: center">V1.0.4</a-layout-footer>
      </a-layout>
    </a-layout>

    <!-- Modern Mobile Menu -->
    <div v-else class="mobile-container">
      <component :is="selectedComponent" />
      
      <!-- Modern Mobile Navigation Bar -->
      <div class="mobile-nav-container">
        <!-- Main Navigation -->
        <div class="modern-floating-menu">
          <div class="nav-item" @click="handleMenu('1')" :class="{ active: selectedComponent === Setting }">
            <div class="nav-icon">
              <SettingOutlined />
            </div>
            <span class="nav-label">Settings</span>
          </div>
          
          <div class="nav-item" @click="handleMenu('5')" :class="{ active: selectedComponent === PartsEntry }">
            <div class="nav-icon">
              <PlusOutlined />
            </div>
            <span class="nav-label">Add Parts</span>
          </div>
          
          <div class="nav-item center-item" @click="handleMenu('6')" :class="{ active: selectedComponent === PartsView }">
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
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed, shallowRef } from "vue";
import { useRoute } from "vue-router";
import {
  SlackOutlined,
  UserOutlined,
  DesktopOutlined,
  LogoutOutlined,
  ShopOutlined,
  PieChartOutlined,
  SaveOutlined,
  UnorderedListOutlined,
  SettingOutlined,
  PlusOutlined,
  MinusOutlined,
  BoxPlotOutlined,
  MoreOutlined,
} from "@ant-design/icons-vue";
import Setting from "../components/SettinsComponent.vue";
import Entry from "../components/Entry.vue";
import Abanicos from "../components/Abanicos.vue";
import Tools from "../components/ToolsEntry.vue";
import CoolRoom from "../components/CoolRoom.vue";
import ToolsView from "../components/ToolsView.vue";
import PartsEntry from "../components/PartsEntry.vue";
import PartsView from "../components/PartsView.vue";
import WorkEntry from "../components/WorkEntry.vue";
import CrearTarea from "../components/Mechanic/CrearTarea.vue";
import TareasPendientes from "../components/Mechanic/TareasPendientes.vue";
import AgregarMaquina from "../components/maquinas/AgregarMaquina.vue";
import VerMaquinas from "../components/maquinas/VerMaquinas.vue";
import WorkView from "../components/WorkView.vue";
import WorkOrderHistory from "../components/WorkOrderHistory.vue";

// Import missing machine components
const EditarMaquina = VerMaquinas; // Using VerMaquinas as fallback for edit
const BorrarMaquina = VerMaquinas; // Using VerMaquinas as fallback for delete
import { useMenuStore } from "../stores/menus";
import Userview from "../components/UserView.vue";
import { useUserStore } from "../stores/user";

const route = useRoute();
const userStore = useUserStore();
const menu = useMenuStore();
const selectedComponent = shallowRef(Setting);
const collapsed = ref(false);
const selectedKeys = ref(["1"]);

const isMenuItemVisible = computed(() => {
  const positions = ["Admin", "QA"];
  return positions.includes(userStore.userData.position);
});

// Valor reactivo para el tamaño de la ventana
const isLargeScreen = ref(window.innerWidth > 576);

const updateScreenSize = () => {
  isLargeScreen.value = window.innerWidth > 576;
};

window.addEventListener("resize", updateScreenSize);

onMounted(() => {
  userStore.getData();
  console.log("Role:", userStore.userData.position);
  console.log("Active Breadcrumb:", route.query.activeBreadcrumb);
  console.log("Menu Key:", route.query.menuKey);

  // Handle navigation from query parameters
  if (route.query.menuKey) {
    console.log('Found menuKey in query params:', route.query.menuKey);
    setTimeout(() => {
      handleMenu(route.query.menuKey);
    }, 100);
  } else if (route.query.activeBreadcrumb) {
    updateBreadcrumbs(route.query.activeBreadcrumb);
  }
  
  // Check for pending navigation in localStorage
  const pendingNavigation = localStorage.getItem('pendingNavigation');
  if (pendingNavigation) {
    console.log('Found pending navigation:', pendingNavigation);
    
    // Clear the pending navigation
    localStorage.removeItem('pendingNavigation');
    
    // Navigate after a short delay to ensure everything is loaded
    setTimeout(() => {
      handleMenu(pendingNavigation);
    }, 200);
  }
  
  // Listen for navigation messages from child components
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'navigate') {
      console.log('Received navigation message:', event.data.key);
      handleMenu(event.data.key);
    }
  });
});

watch(
  () => menu.selectedKey,
  (newKey, oldKey) => {
    console.log("watch llamado con key:", newKey, "oldKey:", oldKey);
    console.log("menu store state:", menu);
    if (newKey && newKey !== "") {
      console.log("About to call handleMenu with key:", newKey);
      handleMenu(newKey);
    } else {
      console.log("Skipping handleMenu because newKey is empty or falsy");
    }
  }
);

// Watch for route changes to handle navigation
watch(
  () => route.query,
  (newQuery) => {
    console.log("Route query changed:", newQuery);
    if (newQuery.menuKey) {
      console.log("Handling navigation from route query:", newQuery.menuKey);
      handleMenu(newQuery.menuKey);
    }
  }
);

onUnmounted(() => {
  window.removeEventListener("resize", updateScreenSize);
  
  // Clean up navigation message listener
  window.removeEventListener('message', (event) => {
    if (event.data && event.data.type === 'navigate') {
      handleMenu(event.data.key);
    }
  });
});

// Bradcrumbs
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

// LogOut
const LogoOut = () => {
  userStore.logoutUser();
};

const handleMenu = (key) => {
  updateBreadcrumbs(breadcrumbNames[key]);
  menu.selectedKey = "";
  console.log("Handle menu llamado", key);
  console.log("Selected Key", selectedKeys);
  console.log("About to switch component for key:", key);

  switch (key) {
    case "1":
      selectedComponent.value = Setting;
      break;
    case "2":
      selectedComponent.value = Entry;
      break;
    case "3":
      selectedComponent.value = Tools;
      break;
    case "4":
      selectedComponent.value = ToolsView;
      break;
    case "5":
      console.log("Switching to PartsEntry component");
      selectedComponent.value = PartsEntry;
      break;
    case "6":
      console.log("Switching to PartsView component");
      selectedComponent.value = PartsView;
      break;
    case "7":
      selectedComponent.value = WorkEntry;
      break;
    case "8":
      selectedComponent.value = WorkView;
      break;
    case "9":
      selectedComponent.value = WorkOrderHistory;
      break;
    case "10":
      selectedComponent.value = CrearTarea;
      break;
    case "11":
      selectedComponent.value = TareasPendientes;
      break;
    case "12":
      selectedComponent.value = WorkOrderHistory;
      break;
    case "13":
      selectedComponent.value = AgregarMaquina;
      break;
    case "14":
      selectedComponent.value = EditarMaquina;
      break;
    case "15":
      selectedComponent.value = BorrarMaquina;
      break;
    case "16":
      selectedComponent.value = VerMaquinas;
      break;
      case "17":
      selectedComponent.value = CoolRoom;
      break;
      case "18":
      selectedComponent.value = Abanicos;
      break;
    default:
      break;
  }
};

// Valor reactivo para el submenú actual
const currentSubMenu = ref(null);

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
</script>

<style scoped>
#components-layout-demo-side .logo {
  height: 32px;
  margin: 16px;
  background: rgba(255, 255, 255, 0.3);
}

.site-layout .site-layout-background {
  background: #fff;
}
[data-theme="dark"] .site-layout .site-layout-background {
  background: #141414;
}

/* Modern Mobile Navigation Styles */
.mobile-container {
  position: relative;
  min-height: 100vh;
  padding-bottom: 90px; /* Space for navigation bar */
}

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

.nav-item.active .nav-icon {
  background: rgba(255, 255, 255, 0.3);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
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

.nav-item.active .nav-label {
  color: white;
  font-weight: 600;
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

.center-item.active .nav-icon-center {
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
  box-shadow: 0 10px 25px rgba(68, 160, 141, 0.4);
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
  max-width: 500px;
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
  
  .mobile-container {
    padding-bottom: 80px;
  }
}
</style>
