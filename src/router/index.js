import { createRouter, createWebHistory } from "vue-router";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseConfig";

// Suponiendo que ya has inicializado tu aplicación Firebase en otro lugar,
// por ejemplo, en un archivo firebaseConfig.js

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/login",
      name: "login",
      component: () => import("../views/Login.vue"),
    },
    {
      path: "/detalles",
      name: "Detalles",
      component: () => import("../components/ToolDetails.vue"),
    },
    {
      path: "/iconos",
      name: "iconos",
      component: () => import("../components/iconos.vue"),
    },
    {
      path: "/coolroom",
      name: "coolroom",
      component: () => import("../components/CoolRoom.vue"),
    },
    {
      path: "/fans",
      name: "fans",
      component: () => import("../components/Abanicos.vue"),
    },
    {
      path: "/workorderdetalles",
      name: "workorderdetalles",
      component: () => import("../components/WorkOderDetalles.vue"),
    },
    {
      path: "/newtag",
      name: "newtag",
      component: () => import("../components/NewTag.vue"),
    },  
    {
      path: "/detalles",
      name: "detalles",
      component: () => import("../components/Partsdetalles.vue"),
    },

    {
      path: "/workorderhistorydetalles",
      name: "workorderhistorydetalles",
      component: () => import("../components/WorkOrderHistoryDetalles.vue"),
    },
    {
      path: "/home",
      name: "home",
      component: () => import("../views/home.vue"),
    },
    {
      path: "/adduser",
      name: "adduser",
      component: () => import("../components/UserAdd.vue"),
    },
    {
      path: "/creartarea",
      name: "CrearTarea",
      component: () => import("../components/Mechanic/CrearTarea.vue"),
    },
    {
      path: "/agregarmaquina",
      name: "agregarmaquina",
      component: () => import("../components/maquinas/AgregarMaquina.vue"),
    },
    {
      path: "/vermaquina",
      name: "vermaquina",
      component: () => import("../components/maquinas/VerMaquinas.vue"),
    },
    {
      path: "/detallesmaquina",
      name: "detallesmaquina",
      component: () => import("../components/maquinas/DetallesMaquinas.vue"),
    },
    {
      path: "/CerrarOrden//:workOrderId",
      name: "CerrarOrden",
      component: () => import("../components/WorkorderClosed.vue"),
    },

    {
      path: "/:catchAll(.*)",
      redirect: "/login",
    },
  ],
});
// Guard de navegación global antes de cada transición de ruta
router.beforeEach(async (to, from, next) => {
  // Lista de rutas que no requieren autenticación
  const publicPages = ["/login", "/"];
  const authRequired = !publicPages.includes(to.path);

  try {
    const loggedIn = await isUserAuthenticated(); // Espera hasta que se resuelva la promesa

    // Si se requiere autenticación y el usuario no está logueado, redirigir a la página de login
    if (authRequired && !loggedIn) {
      next("/login");
    } else {
      // En cualquier otro caso, proceder con la navegación
      next();
    }
  } catch (error) {
    console.error("Error checking authentication", error);
    next("/login");
  }
});

// Función para verificar si el usuario está autenticado
function isUserAuthenticated() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
}
// Guard de navegación global antes de cada transición de ruta

export default router;
