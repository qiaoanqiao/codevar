
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
                break
            case '下划线':
                model = "xh";
                break;
            default:

        }
        var url = window.codevarHost + "/main/translation";
        let urlQ = url + '?input=' + inputValue + "&model=" + model + "&accessToken=" + window.access_token;
        var returnData = {
            resultData:null,
            errorMessage:null,
        };

        window.jquery.ajax({
            url: urlQ,
            type: 'get',
            async: false,
            dataType: 'json',
            data: {
            },
            success: function (data) {
                if(data.code !== 0) {
                    returnData.errorMessage = "请求接口网络错误";
                } else {
                    returnData.resultData = data.data;
                }

            },
            error(status) {
                returnData.errorMessage = "请求接口网络错误";
            }
        });

        return returnData;
    }
};



module.exports = ApiAdaptor;