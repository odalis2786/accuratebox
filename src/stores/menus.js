// stores/menuStore.js
import { defineStore } from "pinia";

export const useMenuStore = defineStore("menu", {
  state: () => ({
    selectedKey: "5",
  }),
  actions: {
    setSelectedKey(key) {
      console.log("SetSelectKey Llamado Valor anteriro:", this.selectedKey);

      this.selectedKey = key;
      console.log("Valor Actual", this.selectedKey);
    },
  },
});
