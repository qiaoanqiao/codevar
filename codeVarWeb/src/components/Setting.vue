
<template>

  <div id="app" class="container">
    <el-form size="medium" label-width="100px" label-position="right">

      <el-row :gutter="20" class="row-bg el-dialog__title text_center">
        设置选项
      </el-row>
      <el-row :gutter="20">
        <el-col :span="6"><div class="grid-content "></div></el-col>
        <el-col :span="12"><div class="grid-content bg-purple">
          <el-form-item label-width="45%" class="el-textarea__inner" label="自动关闭" prop="whether_to_shut_down_automatical">
            <el-switch v-model="whether_to_shut_down_automatical" active-text="选中后自动关闭" @change="switchChange"></el-switch>
          </el-form-item>
        </div></el-col>
        <el-col :span="6"><div class="grid-content"></div></el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="6"><div class="grid-content"></div></el-col>
        <el-col :span="12"><div class="grid-content bg-purple">
          <el-form-item class="el-textarea__inner" label-width="45%" label="输入任意文本匹配翻译" prop="any_text_match">
            <el-switch v-model="any_text_match" active-text="可配合超级面板使用" @change="switchChange"></el-switch>
          </el-form-item>
        </div></el-col>
        <el-col :span="6"><div class="grid-content"></div></el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="6"><div class="grid-content "></div></el-col>
        <el-col :span="12"><div class="grid-content bg-purple">
          <el-form-item label-width="45%" class="el-textarea__inner" label="切换粘贴方式" prop="switch_paste_method">
            <el-switch v-model="switch_paste_method" active-text="开启:模拟输入法;关闭:粘贴快捷键" @change="switchChange"></el-switch>
          </el-form-item>
        </div></el-col>
        <el-col :span="6"><div class="grid-content"></div></el-col>
      </el-row>
      <el-row :gutter="20" class="row-bg el-dialog__title text_center">
        用户信息
      </el-row>
      <el-row type="flex" class="row-bg" justify="center" >
        <el-form-item label="开放ID" prop="openId">
          <el-input v-model="openId" readonly clearable prefix-icon='el-icon-user-solid'
                    :style="{width: '100%'}"></el-input>
        </el-form-item>
        <el-form-item label="过期时间" prop="vipDueTime">
          <el-input v-model="vipDueTime" placeholder="过期时间" readonly clearable
                    prefix-icon='el-icon-time' :style="{width: '100%'}"></el-input>
        </el-form-item>
        <el-form-item label="">
          <el-button type="primary" icon="el-icon-coffee-cup" size="small"  @click="QualityClick"> 续费 </el-button>
        </el-form-item>
      </el-row>
    </el-form>



    <QualityDialog :QualityDialogFlag.sync="QualityDialogFlag"/>
  </div>
</template>

<script>
export default {
  components: {
    QualityDialog: ()=> import("./dialog/RenewDialog")
  },
  name: "HelloWorld",
  data() {
    return {
      QualityDialogFlag: false,
      value: true,
      set: true,
      // 昵称
      // 过期时间
      expirationTime: "",
      switch_paste_method: true,
      any_text_match: true,
      whether_to_shut_down_automatical: true,
      // 设置项数据
      openId: "",
      vipDueTime: "",
    };
  },
  created() {
    this.getInfo();
    this.switchSetting();
  },
  methods: {
      QualityClick() {
        this.QualityDialogFlag = true
      },
      renewal() {
        this.getToken();
        let xhr = null;
        if (window.XMLHttpRequest) {
          xhr = new XMLHttpRequest();
        } else {
          xhr = new ActiveXObject('MicroSoft.XMLHTTP');
        }
        xhr.open('GET', "https://codevar-api.motouguai.com" + "/utools/info?accessToken=" + window.access_token + "&renew=1", true);
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
      // 续费事件
      renewalEvent() {
        this.renewal();
      },
      switchChange: function () {
        console.log(this.whether_to_shut_down_automatical);
        if (this.whether_to_shut_down_automatical) {
          utools.dbStorage.setItem('whether_to_shut_down_automatical', "1")
        } else {
          utools.dbStorage.setItem('whether_to_shut_down_automatical', "0")
        }

        if (this.any_text_match) {
          this.addany_text_match()
          utools.dbStorage.setItem('any_text_match', "1")
        } else {
          this.removeany_text_match()
          utools.dbStorage.setItem('any_text_match', "0")
        }

        if (this.switch_paste_method) {
          utools.dbStorage.setItem('switch_paste_method', "0")
        } else {
          utools.dbStorage.setItem('switch_paste_method', "1")
        }
      },
      switchSetting() {
        let whetherToShutDownAutomatical = utools.dbStorage.getItem('whether_to_shut_down_automatical');
        console.log(whetherToShutDownAutomatical);
        if (whetherToShutDownAutomatical === null) {
          utools.dbStorage.setItem('whether_to_shut_down_automatical', "1")
          this.whether_to_shut_down_automatical = true;
        } else {
          console.log("whetherToShutDownAutomatical");
          if (whetherToShutDownAutomatical === "1") {
            this.whether_to_shut_down_automatical = true;
          } else {
            this.whether_to_shut_down_automatical = false;
          }
        }

        let any_text_match = utools.dbStorage.getItem('any_text_match');
        if (any_text_match === null) {
          utools.dbStorage.setItem('any_text_match', "0")
          this.any_text_match = false
        } else {
          if (any_text_match === "1") {
            this.any_text_match = true;
          } else {
            this.any_text_match = false;
          }
        }

        let switch_paste_method = utools.dbStorage.getItem('switch_paste_method');
        if (switch_paste_method === null) {
          utools.dbStorage.setItem('switch_paste_method', "0")
          this.switch_paste_method = true;
        } else {
          if (switch_paste_method === "1") {
            this.switch_paste_method = false;
          } else {
            this.switch_paste_method = true;

          }
        }
        console.log(whetherToShutDownAutomatical, any_text_match, switch_paste_method);
      },
      removeany_text_match() {
        utools.removeFeature('switch_any_text')
      },
      addany_text_match() {
        utools.setFeature({
          "code": "switch_any_text",
          "explain": "使用变量快速翻译命名插件",
          "cmds": [
            {
              "type": "over",
              "label": "选择格式后进行命名"
            }
          ]
        })
      },
      getInfo() {
        this.getToken();
        let xhr = null;
        if (window.XMLHttpRequest) {
          xhr = new XMLHttpRequest();
        } else {
          xhr = new ActiveXObject('MicroSoft.XMLHTTP');
        }
        xhr.open('GET', "https://codevar-api.motouguai.com" + "/utools/info?accessToken=" + window.access_token, true);
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.setRequestHeader('Content-Type', 'application/json');
        var _this = this;
        xhr.onreadystatechange = () => {
          if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            let data = {};
            try {
              data = JSON.parse(xhr.responseText);
              _this.openId = data.data.openId;
              _this.vipDueTime = data.data.vipDueTime;
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
    }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
/*.container {*/
/*  border: 1px solid #7b7b7b;*/
/*  padding: 5px 20px;*/
/*  display: flex;*/
/*  flex-direction: column;*/
/*  border-radius: 5px;*/
/*}*/

/*.nicknameContainer {*/
/*  padding: 5px 10px;*/
/*  display: flex;*/
/*  align-items: center;*/
/*  justify-content: space-between;*/
/*}*/

/*.mrg-ten {*/
/*  margin-bottom: 10px;*/
/*}*/

.nicknameBox {
  width: 150px;
  border-radius: 2px;
  padding: 5px;
  height: 30px;
  text-align: center;
}

.overflowHidden {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.el-col {
  border-radius: 4px;
}
.bg-purple-dark {
  background: #99a9bf;
}
.bg-purple {
  background: #f9fafc;
}
.bg-purple-light {
  background: #e5e9f2;
}
.grid-content {
  border-radius: 4px;
  min-height: 36px;
}
.row-bg {
  padding: 10px;
  background-color: #f9fafc;
}
.text_center{
  text-align: center;
}
</style>
