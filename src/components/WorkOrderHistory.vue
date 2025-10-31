<template>
  <a-button type="primary" @click="exportToExcel" class="mb-3"
    >Descargar Excel</a-button
  >
  <div v-for="item in paginatedWorkorders" :key="item.id" class="mb-4">
    <a-descriptions
      bordered
      :column="1"
      :labelStyle="{ fontWeight: 'bold', backgroundColor: '#fafafa' }"
      :contentStyle="{ backgroundColor: '#ffffff' }"
    >
      <a-descriptions-item label="Avatar">
        <a-space>
          <a-avatar
            v-if="item.imageUrls && item.imageUrls.length"
            :src="item.imageUrls[0]"
          />
          <a-avatar v-else>
            <UserOutlined />
          </a-avatar>
        </a-space>
      </a-descriptions-item>
      <a-descriptions-item label="W0 #">
        <a-tag color="#1890ff">{{ item.orderNumber }}</a-tag>
      </a-descriptions-item>
      <a-descriptions-item label="Type of Service">
        <a-tag :color="getTypeColor(item.type)">
          <span class="bold-and-large-text">{{ item.type }}</span>
        </a-tag>
      </a-descriptions-item>
      <a-descriptions-item label="Priority">
        <a-tag :color="getPriorityColor(item.prioriti)">{{
          item.prioriti
        }}</a-tag>
      </a-descriptions-item>
      <a-descriptions-item label="Status">
        {{ item.status || "En revisión" }}
      </a-descriptions-item>
      <a-descriptions-item label="Acciones">
        <a-button type="primary" @click="viewDetails(item)"
          >Ver Detalles</a-button
        >
      </a-descriptions-item>
    </a-descriptions>
  </div>
  <a-pagination
    :current="currentPage"
    :total="workorder.length"
    :pageSize="pageSize"
    @change="handlePageChange"
  />
</template>

<script setup>
import ExcelJS from "exceljs";
import { ref, onMounted, computed } from "vue";
import { useDatabaseStore } from "../stores/database.js";
import { UserOutlined } from "@ant-design/icons-vue";
import { useRouter } from "vue-router";
import { format } from "date-fns";

const database = useDatabaseStore();
const router = useRouter();
const currentPage = ref(1);
const pageSize = 5; // Número de órdenes por página

const columns = [
  {
    title: "Creation Date",
    dataIndex: "timestamp",
    key: "timestamp",
    customRender: ({ text }) => {
      if (!text) return "";
      const date = text.toDate();
      return format(date, "MMMM do, yyyy 'at' HH:mm");
    },
  },
  {
    title: "End Date",
    dataIndex: "timeClose",
    key: "timeClose",
    customRender: ({ text }) => {
      if (!text) return "";
      const date = text.toDate();
      return format(date, "MMMM do, yyyy 'at' HH:mm");
    },
  },
  {
    title: "W0 #",
    dataIndex: "orderNumber",
    key: "orderNumber",
  },
  {
    title: "Type of Service",
    dataIndex: "type",
    key: "type",
    customCell: () => {
      return {
        class: "bold-and-large-text",
      };
    },
  },
  {
    title: "Priority",
    dataIndex: "prioriti",
    key: "prioriti",
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    customRender: ({ text }) => {
      return text ? text : "En revisión";
    },
  },
  {
    title: "Acciones",
    key: "actions",
  },
];

const getPriorityColor = (prioriti) => {
  const priorityNumber = Number(prioriti);

  switch (priorityNumber) {
    case 1:
      return "#C12E2A";
    case 2:
      return "#E96125";
    case 3:
      return "#FF8C00";
    case 4:
      return "#008B8B";
    case 5:
      return "#008000";
    default:
      return "default";
  }
};

const exportToExcel = async () => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Work Orders");

  // Define headers and columns
  worksheet.columns = [
    { header: "Creation Date", key: "creationDate", width: 25 },
    { header: "End Date", key: "endDate", width: 25 },
    { header: "W0 #", key: "orderNumber", width: 15 },
    { header: "Type of Service", key: "type", width: 20 },
    { header: "Priority", key: "priority", width: 10 },
    { header: "Status", key: "status", width: 15 },
  ];

  // Add data rows
  workorder.value.forEach((record) => {
    worksheet.addRow({
      creationDate: format(
        record.timestamp.toDate(),
        "MMMM do, yyyy 'at' HH:mm"
      ),
      endDate: format(record.timeClose.toDate(), "MMMM do, yyyy 'at' HH:mm"),
      orderNumber: record.orderNumber,
      type: record.type,
      priority: record.prioriti,
      status: record.status || "En revisión",
    });
  });

  // Style the header row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE0E0E0" },
  };

  // Generate buffer and download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "WorkOrders.xlsx";
  link.click();
  window.URL.revokeObjectURL(url);
};

const getTypeColor = (type) => {
  switch (type) {
    case "External":
      return "#ffc8aa";
    case "Internal":
      return "#bfe1f6";
  }
};

const viewDetails = (workorder) => {
  database.seleccionarWorkOrder(workorder);

  router.push({
    name: "workorderhistorydetalles",
    query: { from: "workview" },
  });
};

onMounted(() => {
  database.fetchWorkordercompleted();
});

const workorder = computed(() => database.workorder);

// Datos paginados
const paginatedWorkorders = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  const end = start + pageSize;
  return workorder.value.slice(start, end);
});

const handlePageChange = (page) => {
  currentPage.value = page;
};
</script>

<style>
.bold-and-large-text {
  font-size: 16px;
  color: black;
}
</style>
