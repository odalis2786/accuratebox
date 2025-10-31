import { defineStore } from "pinia";
import { toRaw } from "vue";
 
 
import {
  AuthCredential,
 
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  getAuth,
  fetchSignInMethodsForEmail,
  sendPasswordResetEmail,
  updateEmail,
  updateProfile,
  EmailAuthProvider,
  updatePassword,
  reauthenticateWithCredential,
} from "firebase/auth";
import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  collection,
} from "firebase/firestore";

import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { auth, db, storage } from "../firebaseConfig";
import router from "../router";
import { useDatabaseStore } from "./database";
import { message } from "ant-design-vue";
export const useUserStore = defineStore("userStore", {
  state: () => ({
    userData: [],
    tags: [],
    users: [],
    userPhoto: "",
    loadingUser: false,
    loadingSession: false,
    admin: false,
    articuloSeleccionado: null,
    PartsSeleccionado: null,
    parts: [],
  }),
  actions: {


    
    async updatePartModel(partId, delta) {
      try {
        // Encuentra la parte seleccionada
        const part = this.parts.find((p) => p.id === partId) || this.PartsSeleccionado;

        if (!part) {
          throw new Error("Parte no encontrada");
        }

        // Calcula la nueva cantidad para `model`
        const newModel = (part.model || 0) + delta;
        if (newModel < 0) return; // No permite cantidades negativas

        // Actualiza localmente
        if (part === this.PartsSeleccionado) {
          this.PartsSeleccionado.model = newModel;
        }

        // Actualiza en Firestore
        const partRef = doc(db, "parts", partId);
        await updateDoc(partRef, { model: newModel });

        console.log(`Cantidad actualizada a ${newModel}`);
      } catch (error) {
        console.error("Error actualizando el campo `model`:", error);
      }
    },
 






    async registerUser(email, password, name) {
      const database = useDatabaseStore();
      this.loadingUser = true;
      try {
        const userCredentials = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        await updateProfile(userCredentials.user, {
          displayName: name,
        });

        router.push("/login");
      } catch (error) {
        console.log(error.code);
        return error.code;
      } finally {
        this.loadingUser = false;
      }
    },

    seleccionarArticulo(articulo) {
      this.articuloSeleccionado = articulo;
    },
    obtenerArticuloSeleccionado() {
      return this.articuloSeleccionado;
    },

    seleccionarParts(parts) {
      console.log("Guardando parte seleccionada en el store:", parts);
      this.PartsSeleccionado = toRaw(parts); // Convierte el Proxy en un objeto plano

    },
    obtenerParts() {
      return this.PartsSeleccionado;
    },

    async fetchUsers() {
      this.users = []; // Reinicia el estado de usuarios
      const querySnapshot = await getDocs(collection(db, "usuarios")); // Asume que tus usuarios están en una colección llamada 'users'
      querySnapshot.forEach((doc) => {
        this.users.push({ id: doc.id, ...doc.data() }); // Agrega los usuarios al estado
      });
    },

    async addUser(userData) {
      try {
        await createUserWithEmailAndPassword(auth, email, "12345678");

        const docRef = await addDoc(collection(db, "usuarios"), userData);
        console.log("Documento escrito con ID: ", docRef.id);
        message.success(" Usuario agregado correctamente.");
      } catch (e) {
        console.error("Error agregando documento: ", e);
        message.error(" No se pudo agregar el usuario.");
      }
    },

    
      async resetPassword(email) {
        this.loadingUser = true;
        const auth = getAuth();
        try {
          // Check if email exists in Firebase Authentication
          const signInMethods = await fetchSignInMethodsForEmail(auth, email);
          
          if (signInMethods.length > 0) {
            // Email is registered, send reset email
            await sendPasswordResetEmail(auth, email);
            message.success("Password reset email sent!");
          } else {
            // Email not found in Firebase Auth
            message.error("This email is not recognized as a user.");
          }
        } catch (error) {
          console.error("Error during password reset process:", error);
          if (error.code === 'auth/invalid-email') {
            message.error("The email address is invalid.");
          } else {
            message.error("An error occurred. Please try again.");
          }
        } finally {
          this.loadingUser = false;
        }
      },
    



    async updatePhoto(imagen) {
      this.loadingUser = true;
      const auth = getAuth();
      const user = auth.currentUser;
      console.log("La imagen es :", imagen);

      //

      //console.log("EL uid del usuarios es", user.uid);
      //console.log(imagen);
      let storageRef = ref(null);
      try {
        storageRef = ref(storage, `${user.email}/${imagen.name}`);
        await uploadBytes(storageRef, imagen.originFileObj);
        const photoURL = await getDownloadURL(storageRef);
        await updateProfile(auth.currentUser, {
          photoURL,
        });
        this.userPhoto = user.photoURL;
        console.log("La url desde el store user es:", this.userPhoto);

        message.success("Profile picture updated successfully.");
      } catch (error) {
        message.error("Error please try again.");
      } finally {
        this.loadingUser = false;
      }
    },

    async updatePassword(nuevosDatos) {
      this.loadingUser = true;
      console.log("Actualizando contraseña");
      console.log("Nuevos dato items:", nuevosDatos);
      const auth = getAuth();
      const user = auth.currentUser;
      const password = nuevosDatos.oldpassword;

      try {
        // Verifica la contraseña actual del usuario antes de actualizarla
        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(user, credential);

        // Actualiza la contraseña
        await updatePassword(user, nuevosDatos.newpassword);

        message.success("Contraseña actualizada exitosamente");
      } catch (error) {
        message.error("No se pudo actualizar la contraseña");
        if (error.code === "auth/wrong-password") {
          message.error("Old password do not mach");
        } else {
          console.error(error);
        }
      } finally {
        this.loadingUser = false;
      }
    },

    async addTool(toolData, images) {
      this.loadingUser = true;
      let storageRef = ref(null);
      try {
        // Paso 1: Crear el documento de la herramienta en Firestore
        const docRef = await addDoc(collection(db, "tools"), toolData);
        console.log("Herramienta añadida con ID:", docRef.id);

        const imageUploads = images.map(async (imageFile) => {
          const imageRef = ref(storage, `tools/${docRef.id}/${imageFile.name}`);
          await uploadBytes(imageRef, imageFile);
          return getDownloadURL(imageRef);
        });

        // Espera a que todas las imágenes sean subidas y recoge sus URLs.
        const imageUrls = await Promise.all(imageUploads);

        // Paso 3: Actualizar el documento con las URLs de las imágenes.
        await updateDoc(doc(db, "tools", docRef.id), { imageUrls });

        message.success("Herramienta e imágenes añadidas exitosamente.");
      } catch (error) {
        message.error("Error al añadir la herramienta e imágenes.");
      } finally {
        this.loadingUser = false;
      }
    },

    async addParts(toolData, images) {
      this.loadingUser = true;
      let storageRef = ref(null);
      try {
        // Check if user is authenticated
        if (!auth.currentUser) {
          throw new Error("User must be authenticated to add parts");
        }
        
        // Paso 1: Crear el documento de la herramienta en Firestore
        const docRef = await addDoc(collection(db, "parts"), toolData);
        console.log("Herramienta añadida con ID:", docRef.id);

        const imageUploads = images.map(async (imageFile) => {
          const imageRef = ref(storage, `parts/${docRef.id}/${imageFile.name}`);
          await uploadBytes(imageRef, imageFile);
          return getDownloadURL(imageRef);
        });

        // Espera a que todas las imágenes sean subidas y recoge sus URLs.
        const imageUrls = await Promise.all(imageUploads);

        // Paso 3: Actualizar el documento con las URLs de las imágenes.
        await updateDoc(doc(db, "parts", docRef.id), { imageUrls });

        message.success("Partes e imágenes añadidas exitosamente.");
      } catch (error) {
        message.error("Error al añadir las partes.");
      } finally {
        this.loadingUser = false;
      }
    },

    async fetchTools() {
      this.tools = [];
      try {
        const querySnapshot = await getDocs(collection(db, "tools"));
        this.tools = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      } catch (error) {
        console.error("Error fetching tools:", error);
      }
    },
    async fetchParts() {
      this.parts = [];
      try {
        const querySnapshot = await getDocs(collection(db, "parts"));
        this.parts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      } catch (error) {
        console.error("Error fetching tools:", error);
      }
    },
    async getData() {
      const auth = getAuth();
      const user = auth.currentUser;

      try {
        const userDocRef = doc(db, "usuarios", user.email);
        const UserDatos = (await getDoc(userDocRef)).data();

        this.userData = {
          ...UserDatos,
          photoUrl: user.photoURL,
        };
      } catch (error) {
        console.log("Un error a ocurrido en getData de user.js");
      }
    },

    async Entry() {
      const auth = getAuth();
      const user = auth.currentUser;
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
    //Borrando personas de la lista de Tags
    async deleteTag(id) {
      console.log("Id:", id);
      const auth = getAuth();
      const user = auth.currentUser;
      try {
        const docRef = doc(db, "tags", id);
        await deleteDoc(docRef);
        message.success("Tag Eliminado");
      } catch (error) {
        console.log(error);

        message.error("No Se pudo eliminar el usuario");
      }
    },

    // actualizo nombre
    async updateName(name) {
      console.log("update name llamado", name);
      this.loadingUser = true;
      const auth = getAuth();
      const user = auth.currentUser;

      try {
        const userDocRef = doc(db, "usuarios", user.email);
        const userDocSnap = await getDoc(userDocRef);

        // Verificar si el documento del usuario ya existe
        if (userDocSnap.exists()) {
          // Si existe, actualizar el nombre
          await updateDoc(userDocRef, {
            nombre: name,
          });

          message.success("Name Update");
        } else {
          // Si no existe, crear un nuevo documento con el correo electrónico del usuario como ID
          await setDoc(userDocRef, {
            nombre: name,
            email: user.email,
          });
          console.log("Nuevo documento de usuario creado");
        }

        const UserDatos = (await getDoc(userDocRef)).data();
        this.userData = UserDatos;
        console.log("New user data:", this.userData);
      } catch (error) {
        message.error("We can not update your name at this moment ");
      } finally {
        this.loadingUser = false;
      }
    },

    // update Email
    async updateEmail(newEmail) {
      console.log("update email llamado", newEmail);
      this.loadingUser = true;
      const auth = getAuth();
      const user = auth.currentUser;
      console.log("El usuario actual es:", user);

      try {
        // Actualizar el correo electrónico en la autenticación de Firebase
        await updateEmail(user, newEmail);

        // Actualizar el correo electrónico en la base de datos Firestore
        const userDocRef = doc(db, "usuarios", user.email);
        const userDocSnap = await getDoc(userDocRef);

        // Verificar si el documento del usuario ya existe
        if (userDocSnap.exists()) {
          // Si existe, actualizar el correo electrónico
          await updateDoc(userDocRef, {
            email: newEmail,
          });
          console.log("Correo electrónico actualizado");
        } else {
          // Si no existe, crear un nuevo documento con el correo electrónico del usuario como ID
          await setDoc(userDocRef, {
            email: newEmail,
          });
          console.log("Nuevo documento de usuario creado");
        }
      } catch (error) {
        console.log("Error ocurrido", error);
      } finally {
        this.loadingUser = false;
      }
    },

    async loginUser(email, password) {
      this.loadingUser = true;
      try {
        const { user } = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        if (user) {
          router.push("/home");
        } else {
          message.error("Un error ha ocurrido al tratar de iniciar sesión");
        }
      } catch (error) {
        console.log(error.code);
        // Aquí manejamos los errores específicos
        if (error.code === "auth/user-not-found") {
          message.error("El correo electrónico no fue encontrado");
        } else if (error.code === "auth/wrong-password") {
          message.error("La contraseña es incorrecta");
        } else {
          // Para cualquier otro error, puedes decidir mostrar un mensaje genérico
          // o manejar más casos específicos si es necesario.
          message.error("Un error ha ocurrido al tratar de iniciar sesión");
        }
        return error.code;
      } finally {
        this.loadingUser = false;
      }
    },

    async logoutUser() {
      const databaseStore = useDatabaseStore();
      databaseStore.$reset();
      useUserStore().$reset();

      try {
        await signOut(auth);
        router.push("/login");
        console.log("secion cerrada");
      } catch (error) {
        console.log(error);
      }
    },

    currentUser() {
      return new Promise((resolve, reject) => {
        const unsuscribe = onAuthStateChanged(
          auth,
          async (user) => {
            if (user) {
              console.log(user);
              // await this.setUser(user);
              this.userData = {
                email: user.email,
                uid: user.uid,
                displayName: user.displayName,
                photoURL: user.photoURL,
              };
            } else {
              this.userData = null;
              const databaseStore = useDatabaseStore();
              databaseStore.$reset();
            }
            resolve(user);
          },
          (e) => reject(e)
        );
        unsuscribe();
      });
    },
  },
});
