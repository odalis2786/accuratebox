// stores/menuStore.js
import { defineStore } from "pinia";

export const useMenuStore = defineStore("menu", {
  state: () => ({
    selectedKey: "5",
  }),
  actions: {
    setSelectedKey(key) {
      console.log("SetSelectKey Llamado Valor anteriro:", this.selectedKey);
      console.log("Setting new key:", key);
      this.selectedKey = key;
      console.log("Valor Actual despues del cambio:", this.selectedKey);
      console.log("Store state after change:", this.$state);
    },
  },
});
