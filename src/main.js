import "../assets/css/bootstrap.min.css";
import "../assets/scss/Style.css";
import { createApp } from "vue";
import { createPinia } from "pinia";
import VuePlyr from "vue-plyr";
import App from "./App.vue";
import router from "./router";
import "bootstrap/dist/css/bootstrap.css";
import "vue-plyr/dist/vue-plyr.css";
import Antd from "ant-design-vue";
import "ant-design-vue/dist/reset.css";

const app = createApp(App);
app.use(Antd);

app.use(VuePlyr);
app.use(createPinia());
app.use(router);

app.mount("#app");
