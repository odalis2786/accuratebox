import { defineStore } from "pinia";
import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  orderBy,
  collection,
  query,
  arrayRemove,
  serverTimestamp,
  arrayUnion,
  deleteDoc,
 
  getFirestore,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage, auth } from "../firebaseConfig";
import { message } from "ant-design-vue";

export const useDatabaseStore = defineStore("database", {
  state: () => ({
    workorder: [],
    maquinas: [],
    emails: [], // Lista local de correos electrónicos para alertas
    tareas: [],
    loading: false,
    tags: [],
    currentUser: null,
    comments: [],
    workorderSeleccionada: null,
    MaquinaSeleccionada: null,
  }),
  actions: {



 


//Start abanicos
 // === MÉTODOS DE ABANICOS ===
async getFanState(fanId) {
  try {
    const docRef = doc(db, "abanicos", fanId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      await setDoc(docRef, {
        encendido: 0,
        manual: 0,
        automatico: 1,
      });
      return { encendido: 0, manual: 0, automatico: 1 };
    }
  } catch (error) {
    console.error("Error al obtener el estado del abanico:", error);
    return { encendido: 0, manual: 0, automatico: 1 };
  }
},

async toggleFan(fanId, isOn) {
  try {
    const fanRef = doc(db, "abanicos", fanId);
    await updateDoc(fanRef, {
      encendido: isOn ? 1 : 0,
      // NO cambiamos manual/automatico desde aquí
    });
  } catch (error) {
    console.error("Error al cambiar estado del abanico:", error);
  }
},

async updateFanMode(fanId, manual) {
  try {
    const fanRef = doc(db, "abanicos", fanId);
    await updateDoc(fanRef, {
      manual: manual,
      automatico: manual === 0 ? 1 : 0,
    });
  } catch (error) {
    console.error("Error al cambiar modo del abanico:", error);
  }
},

 // === MÉTODOS DE VÁLVULA ===
async getValveState() {
  try {
    const docRef = doc(db, "valvula_flour_ginellas", "valvula");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      await setDoc(docRef, {
        encendido: 0,
        manual: 0,
        automatico: 1,
      });
      return { encendido: 0, manual: 0, automatico: 1 };
    }
  } catch (error) {
    console.error("Error al obtener el estado de la válvula:", error);
    return { encendido: 0, manual: 0, automatico: 1 };
  }
},

async setValveState(isOn) {
  try {
    const docRef = doc(db, "valvula_flour_ginellas", "valvula");
    await updateDoc(docRef, {
      encendido: isOn ? 1 : 0,
      // NO cambiamos manual/automatico desde aquí
    });
  } catch (error) {
    console.error("Error al cambiar estado de la válvula:", error);
  }
},

async updateValveMode(manual) {
  try {
    const docRef = doc(db, "valvula_flour_ginellas", "valvula");
    await updateDoc(docRef, {
      manual: manual,
      automatico: manual === 0 ? 1 : 0,
    });
  } catch (error) {
    console.error("Error al cambiar modo de la válvula:", error);
  }
},
 
 
//End abanicos























//CoolRoom



//Delete Email
async deleteAlertEmail(id) {
  try {
    const docRef = doc(db, "alertEmails", id);
    await deleteDoc(docRef);
    console.log(`Email with id ${id} deleted successfully`);
  } catch (error) {
    console.error("Error deleting email:", error);
  }
},















async fetchAlertEmails() {
  try {
    const querySnapshot = await getDocs(collection(db, "alertEmails"));
    this.emails = []; // Limpiar la lista de correos electrónicos antes de llenarla
    querySnapshot.forEach((docSnap) => {
      this.emails.push({ id: docSnap.id, ...docSnap.data() });
    });
     
    return this.emails;
  } catch (error) {
    console.error("Error al obtener los correos electrónicos de alerta:", error);
    return [];
  }
},
//* Agregar un nuevo correo electrónico a la colección `alertEmails`.

 

async saveAlertEmail(email) {
  try {
    // Referencia a la colección `alertEmails`
    const collectionRef = collection(db, "alertEmails");

    // Agregar el documento con un ID automático
    const docRef = await addDoc(collectionRef, { email: email });

   
     
  } catch (error) {
    console.error("Error saving alert email:", error);
    throw new Error("Failed to save email.");
  }
}


,





async fetchSensorsData() {
  try {
    const sensors = ["centro_sensor", "puerta_sensor"];
    const results = {};

    for (const sensor of sensors) {
      const docRef = doc(db, "coolroom", sensor);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        results[sensor] = docSnap.data();
      } else {
        console.error(`No se encontró el documento para ${sensor}.`);
        results[sensor] = null;
      }
    }

    return results; // Devuelve los datos de ambos sensores
  } catch (error) {
    console.error("Error al obtener los datos de Firestore:", error);
    return null;
  }
}
,


async updateTemperatureLimits(sensorId, { high, low }) {
  try {
    const sensorDocRef = doc(db, "coolroom_set", sensorId);
    const timestamp = new Date().toISOString();

    await setDoc(sensorDocRef, {
      temperature_limit_high: high,
      temperature_limit_low: low,
      limit_set_date_high: timestamp,
      limit_set_date_low: timestamp
    }, { merge: true }); // merge: true para no sobreescribir otros campos

    console.log(`Límites de temperatura actualizados para ${sensorId}: HIGH=${high}°F, LOW=${low}°F`);
  } catch (error) {
    console.error(`Error al actualizar los límites para ${sensorId}:`, error);
  }
},


async fetchSensorLimits() {
  try {
    const querySnapshot = await getDocs(collection(db, "coolroom_set"));
    const sensorLimits = {};
    querySnapshot.forEach((docSnap) => {
      sensorLimits[docSnap.id] = docSnap.data();
    });
    return sensorLimits;
  } catch (error) {
    console.error("Error al obtener los límites configurados:", error);
    return {};
  }
},





















    //agregar maquina
    async addMaquina(workOrderData, files) {
      this.loading = true;
      const auth = getAuth();
      const user = auth.currentUser;

      const userDocRef = doc(db, "maquinas", user.email); // Asumiendo que el ID es el correo electrónico
      const userDoc = await getDoc(userDocRef);

      const username = userDoc.data();

      try {
        // Añade lastOrderNumber a workOrderData antes de crear el documento
        const newWorkOrderData = {
          ...workOrderData,
        };

        // Paso 1: Crear el documento de la orden de trabajo en Firestore
        const docRef = await addDoc(
          collection(db, "maquinas"),
          newWorkOrderData
        );
        console.log("Maquina añadida con ID:", docRef.id);

        // Subir imágenes y obtener URLs (Mismo código que ya tienes)
        const imageUploads = files.map(async (imageFile) => {
          const imageRef = ref(
            storage,
            `maquinas/${docRef.id}/${imageFile.name}`
          );
          await uploadBytes(imageRef, imageFile);
          return getDownloadURL(imageRef);
        });

        const imageUrls = await Promise.all(imageUploads);
        await updateDoc(doc(db, "maquinas", docRef.id), { imageUrls });

        message.success("Maquina e imágenes añadidas exitosamente.");
      } catch (error) {
        message.error("Error al añadir las maquinas e imágenes.");
        console.error(error);
      } finally {
        this.loading = false;
      }
    },
    // este metodo lo uso para mostrar las maquians en el componente del imput para agregar una orden de trabajo
    async getMaquinas() {
      this.maquinas = [];
      try {
        const querySnapshot = await getDocs(collection(db, "maquinas"));
        this.maquinas = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      } catch (error) {
        console.error("Error fetching maquinas:", error);
        message.error("Error al cargar las máquinas.");
      }
    },

    //agregar orden de trabajo
    async addWorkOrder(workOrderData, files) {
      this.loading = true;
      const auth = getAuth();
      const user = auth.currentUser;

      const userDocRef = doc(db, "usuarios", user.email); // Asumiendo que el ID es el correo electrónico
      const userDoc = await getDoc(userDocRef);

      const username = userDoc.data();

      message.config({
        top: window.innerHeight - 100,
      });

      try {
        // Paso 0: Consultar y actualizar el contador de órdenes de trabajo
        const counterDocRef = doc(db, "counters", "orderCounter");
        const counterSnap = await getDoc(counterDocRef);
        let lastOrderNumber;
        if (counterSnap.exists()) {
          lastOrderNumber = counterSnap.data().lastOrder + 1;
          await updateDoc(counterDocRef, { lastOrder: lastOrderNumber });
        } else {
          // Si el contador no existe, lo inicializamos con 1
          lastOrderNumber = 1;
          await setDoc(counterDocRef, { lastOrder: lastOrderNumber });
        }

        const newComment = {
          id: doc(collection(db, "dummy")).id, // Genera un ID único para cada comentario.
          text: workOrderData.comentario,
          name: username.nombre,
          email: user.email,
          date: new Date(),
          userphotoURL: user.photoURL, // Asegúrate de que el usuario esté correctamente identificado.
        };

        // Añade lastOrderNumber a workOrderData antes de crear el documento
        const newWorkOrderData = {
          ...workOrderData,
          comments: arrayUnion(newComment),
          orderNumber: lastOrderNumber,
          name: username.nombre,
          email: user.email,
          date: new Date(),
          userphotoURL: user.photoURL, // Asegúrate de que el usuario esté correctamente identificado.
          // Puede ser null para comentarios de primer nivel o contener el ID del comentario al que responde.
          timestamp: serverTimestamp(),
        };

        // Paso 1: Crear el documento de la orden de trabajo en Firestore
        const docRef = await addDoc(
          collection(db, "workOrder"),
          newWorkOrderData
        );
        console.log("Work añadida con ID:", docRef.id);

        // Subir imágenes y obtener URLs (Mismo código que ya tienes)
        const imageUploads = files.map(async (imageFile) => {
          const imageRef = ref(
            storage,
            `workOrder/${docRef.id}/${imageFile.name}`
          );
          await uploadBytes(imageRef, imageFile);
          return getDownloadURL(imageRef);
        });

        const imageUrls = await Promise.all(imageUploads);
        await updateDoc(doc(db, "workOrder", docRef.id), { imageUrls });

        message.success("Work order e imágenes añadidas exitosamente.");
      } catch (error) {
        message.error("Error al añadir la orden de trabajo e imágenes.");
        console.error(error);
      } finally {
        this.loading = false;
      }
    },

    seleccionarWorkOrder(workorder) {
      console.log("Seleccionar Work Orden:", workorder);
      this.workorderSeleccionada = workorder;

      console.log(
        "This work orden seleccionadaeee:",
        this.workorderSeleccionada
      );
    },
    obtenerWorkOrderSeleccionada() {
      console.log("Obtener Work Orden:", this.workorderSeleccionada);
      return this.workorderSeleccionada;
    },

    //seleccionar maquina
    seleccionarMaquina(maquina) {
      console.log("Maquina selecionada:", maquina);
      this.MaquinaSeleccionada = maquina;
      console.log("Maquina seleccionada es:", this.maquinas);
    },
    obtenerMaquinaSeleccionada() {
      console.log("Obtener Work Orden:", this.MaquinaSeleccionada);
      return this.MaquinaSeleccionada;
    },

    //end seleccionar maquina

    async initAuthListener() {
      const auth = getAuth();
      onAuthStateChanged(auth, (user) => {
        if (user) {
          // Usuario está autenticado
          this.currentUser = {
            email: user.email,
            uid: user.uid,
            photoURL: user.photoURL,
            displayName: user.displayName,
          };
        } else {
          // Usuario no está autenticado
          this.currentUser = null;
          console.log("No hay usuario autenticado");
        }
      });
    },

    async updateWorkOrderStatus(workOrderId) {
      const workOrderRef = doc(db, "workOrder", workOrderId); // Asume que workorder.id es el ID de tu documento

      try {
        await updateDoc(workOrderRef, {
          Status: "On It", // Actualiza el campo 'status'
        });
        message.success("Work Order actualizada exitosamente");
      } catch (error) {
        console.log(error);
        if (error !== "cancel") {
          message.error("La actualización fue cancelada o falló");
          console.log("La actualización fue cancelada o falló", error);
        }
      } finally {
      }
    },
    // Dentro de tu store de Pinia
    async updateWorkOrderStatus1(workOrderId, status, comentario) {
      const workOrderRef = doc(db, "workOrder", workOrderId);

      try {
        const updateData = { Status: status, coment: comentario };

        await updateDoc(workOrderRef, updateData);
        message.success("Work Order actualizada exitosamente");
      } catch (error) {
        console.error(error);
        message.error("La actualización falló");
      }
    },
    async Entry() {
      // const auth = getAuth();
      // const user = auth.currentUser;
      this.tags = [];
      try {
        const querySnapshot = await getDocs(collection(db, "tags"));
        querySnapshot.forEach((doc) => {
          this.tags.push(doc.data());
          this.isDataLoaded = true; // Marca los datos como cargados
        });
      } catch (error) {
        console.log(
          "Un error ha ocurrido al intentar obtener los documentos:",
          error
        );
      }
    },
    // Dentro de tu store de Pinia
    async addWorkOrderClosed(workOrderData, newFiles) {
      console.log(" WorkOrderData:", workOrderData);

      try {
        // Paso 1: Recuperar datos existentes de la orden de trabajo
        const originalWorkOrderRef = doc(
          db,
          "workOrder",
          workOrderData.workOrderId
        );
        const originalWorkOrderSnap = await getDoc(originalWorkOrderRef);

        if (!originalWorkOrderSnap.exists()) {
          console.error("No se encontró la orden de trabajo original.");
          message.error("Orden de trabajo original no encontrada.");
          return;
        }

        const originalData = originalWorkOrderSnap.data();
        const existingImageUrls = originalData.imageUrls || [];

        // Paso 2: Subir nuevas imágenes y obtener URLs
        const imageUploads = newFiles.map(async (file) => {
          const imageRef = ref(
            storage,
            `workOrderClose/${workOrderData.workOrderId}/${file.name}`
          );
          await uploadBytes(imageRef, file);
          return getDownloadURL(imageRef);
        });

        const newImageUrls = await Promise.all(imageUploads);

        // Combinar URLs de imágenes existentes con las nuevas
        const allImageUrls = existingImageUrls.concat(newImageUrls);

        // Paso 3: Crear o actualizar el documento en la colección workorderclose
        await setDoc(
          doc(db, "workorderclose", workOrderData.workOrderId),
          {
            ...originalData,
            ...workOrderData,
            imgOrderClose: allImageUrls,
            timeClose: serverTimestamp(),
          },
          { merge: true }
        );

        // Paso 4: Actualizar el estado de la orden de trabajo original a 'closed'
        await deleteDoc(originalWorkOrderRef);

        message.success(
          "Orden de trabajo cerrada exitosamente y datos guardados."
        );
      } catch (error) {
        console.error("Error al cerrar la orden de trabajo:", error);
        message.error("Error al cerrar la orden de trabajo.");
      }
    },
    async deleteWorkOrder(workOrderId) {
      try {
        // Eliminar la orden de trabajo
        await deleteDoc(doc(db, "workOrder", workOrderId));

        // Obtener el documento del contador
        const counterDocRef = doc(db, "counters", "orderCounter");
        const counterSnap = await getDoc(counterDocRef);

        // Asegurar que el documento del contador existe antes de intentar actualizarlo
        if (counterSnap.exists()) {
          const lastOrderNumber = counterSnap.data().lastOrder - 1;
          await updateDoc(counterDocRef, { lastOrder: lastOrderNumber });
        } else {
          console.error("El documento del contador no existe.");
        }

        message.success(
          "Orden de trabajo eliminada exitosamente y contador actualizado."
        );
      } catch (error) {
        message.error("Error al eliminar la orden de trabajo.");
        console.error(
          "Error al eliminar la orden de trabajo y actualizar el contador:",
          error
        );
      }
    },
    // Crear Tarea
    async CrearTarea(comentario, files) {
      const auth = getAuth();
      const user = auth.currentUser;
      let userName = "";

      this.loading = true;
      try {
        if (user) {
          const userEmail = user.email;
          const userDocRef = doc(db, "usuarios", userEmail); // Suponiendo que el ID del documento es el correo electrónico del usuario
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            userName = userData.nombre; // Suponiendo que el campo del nombre es 'nombre'
          } else {
            console.log("No se encontró el documento del usuario.");
          }
        } else {
          console.log("No hay un usuario autenticado.");
        }

        // Paso 0: Consultar y actualizar el contador de órdenes de trabajo
        const counterDocRef = doc(db, "TareaCounter", "orderCounter");
        const counterSnap = await getDoc(counterDocRef);
        let lastOrderNumber;
        if (counterSnap.exists()) {
          lastOrderNumber = counterSnap.data().lastOrder + 1;
          await updateDoc(counterDocRef, { lastOrder: lastOrderNumber });
        } else {
          // Si el contador no existe, lo inicializamos con 1
          lastOrderNumber = 1;
          await setDoc(counterDocRef, { lastOrder: lastOrderNumber });
        }

        // Añade lastOrderNumber a workOrderData antes de crear el documento
        const newWorkOrderData = {
          comentario: comentario.comentario,
          creador: userName,
          orderNumber: lastOrderNumber,
          timestamp: serverTimestamp(),
        };

        // Paso 1: Crear el documento de la orden de trabajo en Firestore
        const docRef = await addDoc(
          collection(db, "CrearTarea"),
          newWorkOrderData
        );
        console.log("Work añadida con ID:", docRef.id);

        // Subir imágenes y obtener URLs (Mismo código que ya tienes)
        const imageUploads = files.map(async (imageFile) => {
          const imageRef = ref(
            storage,
            `TareasCreadas/${docRef.id}/${imageFile.name}`
          );
          await uploadBytes(imageRef, imageFile);
          return getDownloadURL(imageRef);
        });

        const imageUrls = await Promise.all(imageUploads);
        await updateDoc(doc(db, "CrearTarea", docRef.id), { imageUrls });

        message.success("Work order e imágenes añadidas exitosamente.");
      } catch (error) {
        message.error("Error al añadir la orden de trabajo e imágenes.");
        console.error(error);
      } finally {
        this.loading = false;
      }
    },
    // End Crear Tarea

    // Fecth Tareas
    async fetchTareas() {
      console.log("Tareas desde database llamado");

      this.tareas = [];
      try {
        const querySnapshot = await getDocs(collection(db, "CrearTarea"));
        this.tareas = querySnapshot.docs.map((doc) => ({
          id: doc.id,

          ...doc.data(),
        }));
        console.log("Tareas desde database:", this.tareas);
      } catch (error) {
        console.error("Error fetching Tareas:", error);
      }
    },

    // End Fectch Tareas

    async fetchWorkorder() {
      this.workorder = [];
      try {
        const querySnapshot = await getDocs(collection(db, "workOrder"));
        this.workorder = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      } catch (error) {
        console.error("Error fetching workOrder:", error);
      }
    },

    //maquina
    async fetchMaquinas() {
      this.maquinas = [];
      try {
        const querySnapshot = await getDocs(collection(db, "maquinas"));
        this.maquinas = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      } catch (error) {
        console.error("Error fetching maquinas:", error);
      }
    },

    //end maquina
    async saveTag(name, id) {
      try {
        // Usar setDoc para guardar los datos, especificando el ID manualmente
        await setDoc(doc(db, "tags", id), {
          name,
          id,
        });
        message.success("Tag añadido exitosamente.");
      } catch (error) {
        message.error("Tag no pudo ser añadido.");
        console.error(error); // Asegúrate de registrar el error para depuración
        throw error;
      }
    },
    async deleteTag(id) {
      console.log("Id:", id);

      try {
        const docRef = doc(db, "tags", id);
        await deleteDoc(docRef);
        message.success("Tag Eliminado");
      } catch (error) {
        console.log(error);

        message.error("No Se pudo eliminar el usuario");
      }
    },
    async fetchWorkordercompleted() {
      this.workorder = [];
      try {
        const querySnapshot = await getDocs(collection(db, "workorderclose"));
        this.workorder = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      } catch (error) {
        console.error("Error fetching workOrder:", error);
      }
    },

    async addCommentToWorkOrder(workOrderId, comment, parentId = null) {
      const auth = getAuth();
      const user = auth.currentUser;

      const userDocRef = doc(db, "usuarios", user.email); // Asumiendo que el ID es el correo electrónico
      const userDoc = await getDoc(userDocRef);

      const username = userDoc.data();

      const workOrderRef = doc(db, "workOrder", workOrderId);
      const newComment = {
        id: doc(collection(db, "dummy")).id, // Genera un ID único para cada comentario.
        text: comment.text,
        name: username.nombre,
        email: user.email,
        date: new Date(),
        userphotoURL: user.photoURL, // Asegúrate de que el usuario esté correctamente identificado.
        parentId: parentId, // Puede ser null para comentarios de primer nivel o contener el ID del comentario al que responde.
      };

      // Usamos arrayUnion para añadir el comentario al array existente en Firestore automáticamente
      await updateDoc(workOrderRef, {
        comments: arrayUnion(newComment),
      });
    },

    async fetchComments(workId) {
      console.log("El id para buscar el comentario es:", workId);

      try {
        const workOrderRef = doc(db, "workOrder", workId);
        const workOrderDoc = await getDoc(workOrderRef);

        if (!workOrderDoc.exists()) {
          console.log("No matching work order document.");
          this.comments = [];
        } else {
          const workOrderData = workOrderDoc.data();
          console.log("Workorder data:", workOrderData);
          console.log("Workorder data coments:", workOrderData.comments);

          if (
            workOrderData.comments /* && Array.isArray(workOrderData.comments)*/
          ) {
            this.comments = workOrderData.comments.map((comment) => ({
              ...comment,
              id: comment.id || "no-id", // Asumiendo que cada comentario podría tener un ID
            }));
            console.log("Comments loaded:", this.comments);
          } else {
            console.log("No comments in this work order.");
            this.comments = [];
          }
        }
      } catch (error) {
        console.error("Error fetching comments:", error);
        throw error;
      }
    },

    async deleteComment(commentId, workId) {
      const workOrderRef = doc(db, "workOrder", workId);
      const workOrderDoc = await getDoc(workOrderRef);
      if (workOrderDoc.exists()) {
        const currentComments = workOrderDoc.data().comments || [];
        const commentToRemove = currentComments.find((c) => c.id === commentId);
        if (commentToRemove) {
          await updateDoc(workOrderRef, {
            comments: arrayRemove(commentToRemove),
          });
          this.comments = currentComments.filter(
            (comment) => comment.id !== commentId
          );
        }
      }
    },

    async updateWorkOrderClose(workId, timeClose, timestamp) {
      console.log(
        "Los  datos desde el comoponente son:",
        workId,
        timeClose,
        timestamp
      );

      try {
        // Actualiza el documento en la colección workordercolse
        await updateDoc(doc(db, "workorderclose", workId), {
          timeClose: timeClose.$d,
          timestamp: timestamp.$d,
          // Agrega más campos aquí si es necesario
        });

        message.success(" Fechas actualizadas correctamente.");
      } catch (error) {
        console.error("Error al actualizar WorkOrder:", error);
        message.error(" No se pudo actualizar las fechas");
      }
    },
  },
});
