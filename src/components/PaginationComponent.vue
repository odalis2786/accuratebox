<template>
  <div>
    <a-pagination
      :current="currentPage"
      :total="totalOrders"
      :pageSize="pageSize"
      @change="handlePageChange"
      :class="{ 'hide-pagination': hidePagination }"
      class="pagination"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";

const props = defineProps({
  currentPage: Number,
  totalOrders: Number,
  pageSize: Number,
});

const emit = defineEmits(["update:currentPage"]);

const hidePagination = ref(false);
let lastScrollY = 0;

const handleScroll = () => {
  if (window.scrollY > lastScrollY && window.scrollY > 100) {
    hidePagination.value = true;
  } else {
    hidePagination.value = false;
  }
  lastScrollY = window.scrollY;
};

const handlePageChange = (page) => {
  emit("update:currentPage", page);
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});

watch(
  () => props.currentPage,
  (newVal) => {
    emit("update:currentPage", newVal);
  }
);
</script>

<style scoped>
.pagination {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background: #fff;
  padding: 10px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000; /* Asegura que la paginación esté por encima de otros elementos */
  transition: transform 0.3s ease-in-out;
}

.pagination.hide-pagination {
  transform: translateY(-100%);
}
</style>
