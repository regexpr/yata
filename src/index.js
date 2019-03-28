import Vue from 'vue';
import Buefy from 'buefy';
import 'buefy/dist/buefy.css';
import Yata from './Yata.vue';

Vue.use(Buefy);

new Vue({
  el: '#yata',
  render: h => h(Yata)
});