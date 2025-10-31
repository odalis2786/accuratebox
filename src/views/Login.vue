<template>
  <body>
    <section class="py-5">
      <div class="container py-5">
        <div class="row mb-4 mb-lg-5">
          <div class="col-md-8 col-xl-6 text-center mx-auto">
            <p class="fw-bold text-success mb-2">Login</p>
            <h2 class="fw-bold">Mechanic Admin App</h2>
          </div>
        </div>
        <div class="row d-flex justify-content-center">
          <div class="col-md-6 col-xl-4">
            <div class="card">
              <div
                class="card-body text-center d-flex flex-column align-items-center"
              >
                <div
                  class="bs-icon-xl bs-icon-circle bs-icon-primary shadow bs-icon my-4"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="1em"
                    height="1em"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                    class="bi bi-person"
                  >
                    <path
                      d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664z"
                    ></path>
                  </svg>
                </div>
                <form
                  method="post"
                  data-bs-theme="light"
                  @submit.prevent="login"
                >
                  <div class="mb-3">
                    <input
                      v-model="email"
                      class="form-control"
                      type="email"
                      name="email"
                      placeholder="Email"
                    />
                  </div>
                  <div class="mb-3" style="margin-bottom: 100px">
                    <div class="input-group">
                      <input
                        v-model="password"
                        class="form-control"
                        :type="showPassword ? 'text' : 'password'"
                        name="password"
                        placeholder="Password"
                      />
                      <button
                        class="btn btn-outline-secondary"
                        type="button"
                        @click="showPassword = !showPassword"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          class="bi bi-eye"
                          viewBox="0 0 16 16"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M8 4s4 0 4 3-4 3-4 3-4 0-4-3 4-3 4-3zm0 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"
                          />
                          <path
                            fill-rule="evenodd"
                            d="M1.146 7.646a.5.5 0 0 1 .708-.708l12 12a.5.5 0 0 1-.708.708l-12-12z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div
                    class="mt-3"
                    style="margin-bottom: 100px; margin-left: 10px"
                  >
                    <button
                      class="btn mt-3 pt-3 btn-primary shadow d-block w-50"
                      type="submit"
                      :disabled="user.loading"
                    >
                      <span
                        v-if="user.loading"
                        class="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      <span v-else>Log in</span>
                    </button>
                  </div>
                </form>
                <div class="mb-3 text-center">
      <a href="#" @click="openPasswordResetModal" class="text-muted">Forgot your password?</a>
    </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

   <!-- Modal de confirmación -->
   <Modal
      v-model:visible="isModalVisible"
      title="Reset Password"
      @ok="handleResetPassword"
      @cancel="cancelPasswordReset"
    >
      <p>Enter your email to reset your password:</p>
      <Input 
        v-model:value="resetEmail" 
        placeholder="Enter your email address" 
        type="email"
      />
    </Modal>

  </body>
</template>

<script setup>
import { ref } from "vue";
import { useUserStore } from "../stores/user.js";
import { Modal , Input } from 'ant-design-vue';
import { message} from 'ant-design-vue'; // Ensure this is imported if using message.success/error


const user = useUserStore();

// Estado local del componente
const email = ref("");
const password = ref("");
const showPassword = ref(false);
const isModalVisible = ref(false);
const resetEmail = ref("");



// Open modal for password reset
const openPasswordResetModal = () => {
  isModalVisible.value = true;
};





// Método para el inicio de sesión
const login = () => {
  user.loginUser(email.value, password.value);
};

 // Handle password reset
const handleResetPassword = async () => {
  console.log("Handling reset password for:", resetEmail.value);
  if (!resetEmail.value) {
    Modal.error({
      title: 'Error',
      content: 'Please enter an email address.',
    });
    return;
  }
  try {
    // Here you would call the actual reset password function from your store
    await user.resetPassword(resetEmail.value);
    // Modal.success({
    //   title: 'Success',
    //   content: 'Password reset email sent!',
    // });
    resetEmail.value = ""; // Clear the input
    isModalVisible.value = false; // Close modal
  } catch (error) {
    console.error("Error in password reset:", error);
    Modal.error({
      title: 'Error',
      content: `Failed to send password reset email: ${error.message || "Unknown error."}`,
    });
  }
};

// Cancel password reset
const cancelPasswordReset = () => {
  resetEmail.value = ""; // Clear the email input if user cancels
  isModalVisible.value = false;
};



</script>
