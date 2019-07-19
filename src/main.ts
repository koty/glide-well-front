import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import './registerServiceWorker';
import Element from 'element-ui';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faSwimmer, faEdit, faTrash, faBicycle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import './plugins/element.js'

library.add(faSwimmer);
library.add(faEdit);
library.add(faTrash);
library.add(faBicycle);

Vue.component('font-awesome-icon', FontAwesomeIcon);
Vue.use(Element);
Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
