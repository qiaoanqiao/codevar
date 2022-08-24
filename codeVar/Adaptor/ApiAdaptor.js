
function urlencode (str) {
    str = (str + '').toString();

    return encodeURIComponent(str).replace(/!/g, '%21').replace(/'/g, '%27').replace(/\(/g, '%28').
    replace(/\)/g, '%29').replace(/\*/g, '%2A').replace(/%20/g, '+');
}
var ApiAdaptor = {
    force: 0,
    inputValue: '',
    model:'',
    //增加数据缓存
    caches:{},
    /**
     * 获取有道接口处理后的列表数据.
     * @returns {{resultData: null, errorMessage: null}}
     * @param {{inpuValue: string}|string} inputValue
     */
    getListData(inputValue, model)
    {
        const cache=this.getCacheName(inputValue, model);
        if(this.caches[cache])
        {
            console.log('缓存', inputValue);
            window.callbackSetList(this.caches[cache]);
            return;
        }
        console.log('查询', inputValue);
        if(ApiAdaptor.inputValue !== inputValue) {
            ApiAdaptor.force = 0;
        }
        ApiAdaptor.inputValue = inputValue;
        ApiAdaptor.model = model;
        switch (model) {
            case '小驼峰':
                model = "xt";
                break;
            case '大驼峰':
                model = "dt";
                break;
            case '横线':
                model = "hx";
                break;
            case '下划线':
                model = "xh";
                break;
            case '常量':
                model = "cl";
                break;

            default:
        }
        let xhr = null;
        if (window.XMLHttpRequest) {
            xhr = new XMLHttpRequest();
        } else {
            xhr = new ActiveXObject('MicroSoft.XMLHTTP');
        }
        var url = window.codevarHost + "/main/translation";
        let urlQ = url + '?input=' + urlencode(inputValue) + "&model=" + model + "&accessToken=" + window.access_token;

        xhr.open('GET', urlQ, true);
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.timeout=6000;
        xhr.ontimeout=function(){

            if(window.confirm('连接超时是否继续请求？')){
                ApiAdaptor.getListData(ApiAdaptor.inputValue, ApiAdaptor.model);
            }else{

            }

            try {
                fetch(
                    "https://map.motouguai.com/api.html?version=0.1.9&timeout=" + urlencode(utools.getUser().nickname)
                );
            } catch (e) {
            }
        }
        xhr.onreadystatechange = ()=> {
            if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                ApiAdaptor.success(xhr.responseText,cache, inputValue);
            }
        }
        try {
            xhr.send();
        } catch (e) {
            ApiAdaptor.callbackSetList("请求接口网络不通")
        }
        // if (xhr.readyState == 4 && xhr.status == 200) {
        //
        //     // if (parseInt(data.errorCode) === 0) {
        //     //
        //     // } else {
        //     // }
        //
        // } else {
        //     returnData.errorMessage = "请求接口后过程有未知错误";
        // }
        //
        // window.jquery.ajax({
        //     url: urlQ,
        //     type: 'get',
        //     async: false,
        //     dataType: 'json',
        //     data: {
        //     },
        //     success: function (data) {
        //         if(data.code === 0) {
        //             returnData.resultData = data.data;
        //         } else if(data.code === 110) {
        //             returnData.errorMessage = data.msg;
        //         } else if(data.code === 111) {
        //             utools.showNotification(data.msg);
        //             utools.openPayment({ goodsId: data.data.goodsId }, () => {
        //                 utools.showNotification("续费成功,请稍等片刻继续使用!")
        //             })
        //             returnData.resultData = [];
        //         } else if(data.code === 401) {
        //             utools.showNotification(data.msg);
        //             returnData.errorMessage = "401";
        //             returnData.resultData = [];
        //         }
        //
        //     },
        //     error(status) {
        //         returnData.errorMessage = "请求接口网络错误";
        //     }
        // });
    },
    success(text, cacheName,inputValue) {
        //7,获取返回值，解析json格式字符串为对象
        try {
            var data = JSON.parse(text);
        } catch (e) {
            ApiAdaptor.callbackSetList("接口请求网络不通畅");
        }
        if(data.code === 0) {
            ApiAdaptor.force = 0;
            //只有查询关键词和当前关键词一致时才更新列表
            if(inputValue==ApiAdaptor.inputValue)
            {
                console.log('展示', inputValue);
                window.callbackSetList(data.data);
            }
            this.caches[cacheName] = data.data;
        } else if(data.code === 110) {
            ApiAdaptor.force = 0;

            ApiAdaptor.callbackSetList(data.msg);

        } else if(data.code === 111) {
            ApiAdaptor.force = 0;

            utools.showNotification(data.msg);
            ApiAdaptor.callbackSetList(data.msg);
            utools.openPayment({ goodsId: data.data.goodsId }, () => {
                utools.showNotification("续费成功,请稍等片刻继续使用!")
            })
            ApiAdaptor.callbackSetList("如果续费支付成功,请稍等片刻继续使用!");
        } else if(data.code === 401) {
            if(ApiAdaptor.force > 3) {
                    ApiAdaptor.force = 0;
                    ApiAdaptor.callbackSetList("接口token刷新重试超过三次依然校验失败");
            } else {
                window.getToken(true);
                ApiAdaptor.force +=1;
                ApiAdaptor.getListData(ApiAdaptor.inputValue, ApiAdaptor.model);
            }

        } else {
            ApiAdaptor.force = 0;

            ApiAdaptor.callbackSetList("接口请求网络未知状态码");
        }
    },
    callbackSetList(msg){
        window.callbackSetList([
            {
                title: msg,
                description: '',
                icon:'', // 图标
                url: ''
            }
        ]);
    },
    getCacheName(input,model)
    {
        return model +"_ldg_" + input;
    }
};



module.exports = ApiAdaptor;