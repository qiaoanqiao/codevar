
function urlencode (str) {
    str = (str + '').toString();

    return encodeURIComponent(str).replace(/!/g, '%21').replace(/'/g, '%27').replace(/\(/g, '%28').
    replace(/\)/g, '%29').replace(/\*/g, '%2A').replace(/%20/g, '+');
}
var ApiAdaptor = {
    /**
     * 获取有道接口处理后的列表数据.
     * @returns {{resultData: null, errorMessage: null}}
     * @param {{inpuValue: string}|string} inputValue
     */
    getListData(inputValue, model)
    {
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
        var url = window.codevarHost + "/main/translation";
        let urlQ = url + '?input=' + urlencode(inputValue) + "&model=" + model + "&accessToken=" + window.access_token;
        var returnData = {
            resultData:null,
            errorMessage:null,
        };
        let xhr = null;
        if (window.XMLHttpRequest) {
            xhr = new XMLHttpRequest();
        } else {
            xhr = new ActiveXObject('MicroSoft.XMLHTTP');
        }
        xhr.open('GET', urlQ, false);
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send();
        if (xhr.readyState == 4 && xhr.status == 200) {
            //7,获取返回值，解析json格式字符串为对象
            try {
                var data = JSON.parse(xhr.responseText);
            } catch (e) {
                returnData.errorMessage = "请求接口网络错误";
            }
            if(data.code === 0) {
                returnData.resultData = data.data;
            } else if(data.code === 110) {
                returnData.errorMessage = data.msg;
            } else if(data.code === 111) {
                utools.showNotification(data.msg);
                utools.openPayment({ goodsId: data.data.goodsId }, () => {
                    utools.showNotification("续费成功,请稍等片刻继续使用!")
                })
                returnData.resultData = [];
            } else if(data.code === 401) {
                utools.showNotification(data.msg);
                returnData.errorMessage = "401";
                returnData.resultData = [];
            }
            // if (parseInt(data.errorCode) === 0) {
            //
            // } else {
            // }

        } else {
            returnData.errorMessage = "请求接口网络错误";
        }
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

        return returnData;
    }
};



module.exports = ApiAdaptor;