
// 原因：因為後台沒有加入購物車選項
// 『一般使用者』的前台流程：
// 0. 切版 √
// 1. 取得產品列表 √
// 2. 按按鈕，顯示單一產品細節 √
// 3. 加入購物車(可選擇數量) √
// 4. 購物車列表 √
// 5. 調整數量 √
// 6. 刪除品項 √
// 7. 刪除所有購物車品項 √
// -------------------------------------------

// Vee-validate
Object.keys(VeeValidateRules).forEach(rule => {
  if (rule !== 'default') {
    VeeValidate.defineRule(rule, VeeValidateRules[rule]);
  }
});
// 讀取外部的資源
VeeValidateI18n.loadLocaleFromURL('./zh_TW.json');

// Activate the locale
VeeValidate.configure({
  generateMessage: VeeValidateI18n.localize('zh_TW'),
  validateOnInput: true, // 調整為：輸入文字時，就立即進行驗證
});


const apiUrl = 'https://vue3-course-api.hexschool.io/v2';
const apiPath = 'zack_p';


// 區域註冊
const productModal = {
  // 當點 id 變動時，取得遠端資料，並呈現 Modal
  props:['id','addToCart','openModal'],
  data() {
    return {
      userPModal: {},
      tempProduct: {}, 
      qty: 1,
    }
  },
  template: '#userProductModal', 
  watch: {
    id() {  
      // console.log('watch監聽id變動：', this.id);
      // this.id有傳入時才抓取單一產品資訊
      if (this.id) {
        axios(`${apiUrl}/api/${apiPath}/product/${this.id}`)
          .then((res) => {
            // console.log("取得單一產品資訊：", res.data.product);
            this.tempProduct = res.data.product;
            this.userPModal.show();
            this.loadingItem = '';         
          })
          .catch((err) => {
            alert(err.response.data.message);
          })
      }
    }
  },
  methods: {
    hide() {
      this.userPModal.hide();
    }
  },
  mounted() {
    this.userPModal = new bootstrap.Modal(this.$refs.pModal,{
      keyboard: false
    });
    this.$refs.pModal.addEventListener('hidden.bs.modal', event => {
      this.openModal('');
    })
  },
}

// Vue.js

const app = Vue.createApp({
  data() {
    return {
      products: [],
      productId: '',
      cart: {},
      loadingItem: '', // 存id
      form: {
        user: {
          name: '',
          email: '',
          tel: '',
          address: '',
        },
        message: '',
      }
    }
  },
  components: {
    productModal,
  },
  methods: {
    getProducts() {
      axios(`${apiUrl}/api/${apiPath}/products/all`)
        .then((res) => {
          // console.log("產品列表：", res.data.products);
          this.products = res.data.products;
        })
        .catch((err) => {
          alert(err.response.data.message);
        })
    },
    addToCart(product_id, qty = 1) {     
      const data = {
        product_id,
        qty,
      }
      this.loadingItem = product_id;
      axios.post(`${apiUrl}/api/${apiPath}/cart`, { data })
        .then((res) => {
          alert(res.data.message);
          this.$refs.userPModal.hide();
          this.getCarts();  
          this.loadingItem = '';   
        })
        .catch((err) => {
          alert(err.response.data.message);
        })
    },
    openModal(id) {     
      this.loadingItem = id;    
      this.productId = id;
      // console.log('外層傳入的Id', id);
    }, 
    getCarts() {
      axios(`${apiUrl}/api/${apiPath}/cart`)
        .then((res) => {
          // console.log("取得購物車列表：", res.data.data); 
          this.cart = res.data.data;         
        })
        .catch((err) => {
          alert(err.response.data.message);
        })
    },
    updateCartQty(item) { //購物車 id  產品 id
      const data = {
        product_id: item.product.id, 
        qty: item.qty,
      }
      this.loadingItem = item.id;
      axios.put(`${apiUrl}/api/${apiPath}/cart/${item.id}`, { data })
        .then((res) => {
          // console.log("更新購物車：", res.data.data); 
          this.getCarts();
          this.loadingItem = '';    
        })
        .catch((err) => {
          alert(err.response.data.message);
        })
    },
    deleteCartItem(item) {
      this.loadingItem = item.id;
      axios.delete(`${apiUrl}/api/${apiPath}/cart/${item.id}`)
        .then((res) => {
          alert(res.data.message); 
          this.getCarts();     
          this.loadingItem = '';   
        })
        .catch((err) => {
          alert(err.response.data.message);
        })
    },
    deleteAllCartsItem() {
        axios.delete(`${apiUrl}/api/${apiPath}/carts`)
        .then((res) => {
          // console.log("刪除所有購物車列表：", res.data.data); 
          this.getCarts();        
        })
        .catch((err) => {
          alert(err.response.data.message);
        })
    },
    createOrder() {
      const url = `${apiUrl}/api/${apiPath}/order`;
      const order = this.form;
      axios.post(url, { data: order })
        .then((res) => {
          console.log(res.data.message);
          this.$refs.form.resetForm();          
          this.getCarts();
        })
        .catch((err) => {
          alert(err.response.data.message);
        })
    }
  },
  mounted() {
    this.getProducts();
    this.getCarts();
  },
})

// Vee-validate
app.component('VForm', VeeValidate.Form);
app.component('VField', VeeValidate.Field);
app.component('ErrorMessage', VeeValidate.ErrorMessage);

app.mount('#app');