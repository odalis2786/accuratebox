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
            <a-menu-item key="3" @click="handleMenu('3')"
              >Tools Entry</a-menu-item
            >
            <a-menu-item key="4" @click="handleMenu('4')"
              >Tools View</a-menu-item
            >
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
              Agregar
            </a-menu-item>
            <a-menu-item key="16" @click="handleMenu('16')"> Ver</a-menu-item>
            <a-menu-item key="14" @click="handleMenu('14')">
              Borrar</a-menu-item
            >
            <a-menu-item key="15" @click="handleMenu('15')">
              Editar</a-menu-item
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

    <!-- Menú pequeño para pantallas pequeñas -->
    <div v-else>
      <component :is="selectedComponent" />
      <div class="floating-menu">
       
        <a-button type="link" @click="toggleSubMenu('shop')"
          ><ShopOutlined
        /></a-button>
        

        <a-button type="link" @click="LogoOut()"><LogoutOutlined /></a-button>
      </div>
      <div v-if="currentSubMenu === 'settings'" class="submenu">
        <a-button type="link" @click="handleMenu('1')">Account</a-button>
      </div>
      <div v-if="currentSubMenu === 'shop'" class="submenu">
        
        
        <a-button type="link" @click="handleMenu('5')">Parts Entry</a-button>
        <a-button type="link" @click="handleMenu('6')">Parts View</a-button>
      </div>
      <div v-if="currentSubMenu === 'workOrder'" class="submenu">
        <a-button type="link" @click="handleMenu('7')"
          >Work Order Entry</a-button
        >
        <a-button type="link" @click="handleMenu('8')"
          >Work Order View</a-button
        >
        <a-button type="link" @click="handleMenu('9')"
          >Work Order completed</a-button
        >
      </div>
      <div v-if="currentSubMenu === 'mechanicWork'" class="submenu">
        <a-button type="link" @click="handleMenu('10')">Crear tarea</a-button>
        <a-button type="link" @click="handleMenu('11')"
          >Work Order View</a-button
        >
        <a-button type="link" @click="handleMenu('12')"
          >Work Order completed</a-button
        >
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

  if (route.query.activeBreadcrumb) {
    updateBreadcrumbs(route.query.activeBreadcrumb);
  }
});

watch(
  () => menu.selectedKey,
  (newKey) => {
    console.log("watch llamado con key:", newKey);
    if (newKey) {
      handleMenu(newKey);
    }
  }
);

onUnmounted(() => {
  window.removeEventListener("resize", updateScreenSize);
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
  10: "Crear Tarea",
  11: "Mechanic Work View",
  12: "Mechanic Work Completed",
  13: "Agregar Maquinas",
  14: "Borrar Maquinas",
  15: "Editar Maquinas",
  16: "Ver Maquinas",
  17: "CoolRoom",
  18: "Abanicos",
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
      selectedComponent.value = PartsEntry;
      break;
    case "6":
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
  currentSubMenu.value = currentSubMenu.value === menu ? null : menu;
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

.floating-menu {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background: #fff;
  display: flex;
  justify-content: space-around;
  padding: 10px 0;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
}

.submenu {
  position: fixed;
  bottom: 50px;
  left: 0;
  width: 100%;
  background: #fff;
  display: flex;
  justify-content: space-around;
  padding: 10px 0;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
}
</style>
