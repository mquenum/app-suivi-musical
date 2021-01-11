import Vue from 'vue'
// eslint-disable-next-line no-unused-vars
import axios from 'axios'
// eslint-disable-next-line no-unused-vars
import VueAxios from 'vue-axios'
import App from './App.vue'

Vue.config.productionTip = false

Vue.Discogs = Vue.prototype.Discogs = require('disconnect').Client;

// add discogs consumerKey and consumerSecret
Vue.db = Vue.prototype.db = new Vue.Discogs('AppSuiviMusical/1.0.1', {
  consumerKey: 'consumerKey',
  consumerSecret: 'consumerSecret'}).database();

new Vue({
  render: h => h(App),
}).$mount('#app')
