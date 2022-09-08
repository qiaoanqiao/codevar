<template>

  <el-dialog
    title="续费"
    :visible.sync="visible"
    :close-on-click-modal="false"
    @close="RenewalPopUpWindow"
  >
    <el-form ref="elForm" :model="formData" :rules="rules" size="medium" label-width="120px">
      <el-form-item label="续费时长">
        <el-select @change="selectChange" v-model="formData.renewalDuration" placeholder="点击选择选择续费时长" clearable
                   :style="{width: '100%'}">
          <el-option v-for="(item, index) in renewalDurationOptions" :key="index" :label="item.label"
                     :value="item.value" :disabled="item.disabled"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="金额">
        <el-row :gutter="20">
          <el-col :span="12"><div class="grid-contents line-through">原价:{{formData.amountPayable}}
          </div></el-col>
          <el-col :span="12"><div class="grid-content" style="color: #ec32e2">现价:{{formData.nowAmountPayable}}</div></el-col>
        </el-row>
      </el-form-item>
    </el-form>

  <span slot="footer" class="dialog-footer">
          <el-button @click="RenewalPopUpWindow">取 消</el-button>
          <el-button type="primary" @click="ok">选好了, 我要续费</el-button>
      </span>
  </el-dialog>
</template>

<script>
export default {
  name: "RenewDialog",
  components: {},
  props: {
    QualityDialogFlag: {
      default: false
    },
  },
  data() {
    return {
      visible: false,
      formData: {
        renewalDuration: '',
        amountPayable:"4.9 ¥",
        nowAmountPayable:"4.9 ¥",
      },
      rules: {
        renewalDuration: [{
          required: true,
          message: '请择选拉下选择选择续费时长',
          trigger: 'change'
        }],
      },
      renewalDurationOptions: [{
        "label": "两个月",
        "value": "two",
        "discountBefore":"4.92 ¥",
        "discountAfter":"4.92 ¥"
      }, {
        "label": "半年",
        "value": "six",
        "discountBefore":"14.7 ¥",
        "discountAfter":"13.23 ¥"
      }, {
        "label": "一年",
        "value": "twelve",
        "discountBefore":"29.4 ¥",
        "discountAfter":"25.87 ¥"
      }],
    };
  },
  created() {},
  mounted() {},
  methods: {
    selectChange(val){
      for (let renewalDurationOption of this.renewalDurationOptions) {
        if(renewalDurationOption.value === val) {
          this.formData.amountPayable = renewalDurationOption.discountBefore
          this.formData.nowAmountPayable = renewalDurationOption.discountAfter
        }
      }
    },
    RenewalPopUpWindow() {
      this.$emit("update:QualityDialogFlag", false);
    },
    ok() {
      this.renewal(this.formData.renewalDuration)
      this.$emit("update:QualityDialogFlag", false);
    },
    submitForm() {
      this.$refs['elForm'].validate(valid => {
        if (!valid) return
        // TODO 提交表单
      })
    },
    resetForm() {
      this.$refs['elForm'].resetFields()
    },
    renewal(renewGear) {
      console.log(renewGear);
      this.getToken();
      let xhr = null;
      if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
      } else {
        xhr = new ActiveXObject('MicroSoft.XMLHTTP');
      }
      xhr.open('GET', "https://codevar-api.motouguai.com" + "/utools/info?accessToken=" + window.access_token + "&renew=1&renewGear=" + renewGear, true);
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
          var data = {};
          try {
            data = JSON.parse(xhr.responseText);
            if (data.code === 110) {
              utools.showNotification(data.msg);
            } else if (data.code === 111) {
              utools.showNotification(data.msg);
              utools.openPayment({goodsId: data.data.goodsId}, () => {
                utools.showNotification("续费成功,请稍等片刻继续使用!")
              })
            }
          } catch (e) {
            alert(e);
          }

        }
      }
      try {
        xhr.send();
      } catch (e) {
        alert("请求失败哈")
      }


    },
    getToken(force) {
      console.log("getToken" + force);
      var token = utools.db.get("token");
      var tokenTime = utools.db.get("token_time");
      if (token != null && tokenTime != null) {
        if ((Date.now() - tokenTime.data) < 6100000 && force !== true) {
          window.access_token = token.data;
          return;
        } else {
          utools.fetchUserServerTemporaryToken().then((res) => {
            window.access_token = res.token;

            utools.db.put({
              _id: "token",
              data: res.token,
              _rev: token._rev
            })
            utools.db.put({
              _id: "token_time",
              data: Date.now(),
              _rev: tokenTime._rev
            })
          });
        }
      } else {
        utools.fetchUserServerTemporaryToken().then((res) => {
          window.access_token = res.token;

          utools.db.put({
            _id: "token",
            data: res.token
          })
          utools.db.put({
            _id: "token_time",
            data: Date.now()
          })
        });
      }
    }

  },
  watch: {
    QualityDialogFlag() {
      this.visible = this.QualityDialogFlag;
    },
  }
};
</script>
<style>

.line-through {
  position: relative;
  display: inline-block;
}
.line-through::before, .line-through::after {
  content: '';
  width: 100%;
  position: absolute;
  right: 0;
  top: 50%;
}
.line-through::before {
  border-bottom: 1px solid rgba(0, 0, 255, 0.47);
  -webkit-transform: skewY(-10deg);
  transform: skewY(-10deg);
}
.line-through::after {
  border-bottom: 1px solid rgba(255, 0, 0, 0.33);
  -webkit-transform: skewY(10deg);
  transform: skewY(10deg);
}
</style>
