window.codevarHost = "https://codevar-api.motouguai.com";
// window.codevarHost = "http://127.0.0.1:8080";
const ApiAdaptor = require('./Adaptor/ApiAdaptor.js');
const access_token = "";

/**
 * 进入模式, xt,dt等等
 * @type {string}
 */
var model = '';
/**
 * 搜索框提示文本
 * @type {string}
 */
var promptText = '请输入要转化的文字';
/**
 * 搜索字符串
 * @type {{inpuValue: string}}
 */
var inputValue = {inpuValue:""};

/**
 * 输入延迟搜素时间(毫秒)
 * @type {number}
 */
var inputLag = 250;

/**
 * 任意关键词模式,搜索文字
 * @type {string}
 */
var mathSearchWord = "";
/**
 * 任意关键词模式, 是否重复搜索
 * @type {boolean}
 */
var mathIsInSearch = false;

/**
 * 任意关键词模式, 是否第一次搜索
 * @type {boolean}
 */
var isMathFirst = true;


window.timerRunner = false;

getToken();
try {
    let fetchRes = fetch(
        window.codevarHost + "/utools/info?accessToken=" + window.access_token);
} catch (e) {
}
const sint= setInterval(()=>{
    getToken();
    try {
        let fetchRes = fetch(
            window.codevarHost + "/utools/info?accessToken=" + window.access_token);
    } catch (e) {
    }
},3080000);
/**
 * 插件进入对应模式响应
 */
window.exports = {
    //转换内容为大驼峰命名格式
    "big_hump": {
        mode: "list",
        args: {
            enter: (action, callbackSetList) => {
                onEnter(action, callbackSetList);
            },
            search: (action, searchWord, callbackSetList) => {
                onSearch(action.payload, searchWord, callbackSetList);
            },
            select: (action, itemData) => {
                onSelect(action, itemData);
            },
            placeholder: promptText,
        }
    },
    //转换内容为小驼峰命名格式
    "small_hump": {
        mode: "list",
        args: {
            enter: (action, callbackSetList) => {
                onEnter(action, callbackSetList);
            },
            search: (action, searchWord, callbackSetList) => {
                onSearch(action.payload, searchWord, callbackSetList);
            },
            select: (action, itemData) => {
                onSelect(action, itemData);
            },
            placeholder: promptText,
        }
    },
    //转换内容为下划线命名格式
    "underline": {
        mode: "list",
        args: {
            enter: (action, callbackSetList) => {
                onEnter(action, callbackSetList);
            },
            search: (action, searchWord, callbackSetList) => {
                onSearch(action.payload, searchWord, callbackSetList);
            },
            select: (action, itemData) => {
                onSelect(action, itemData);
            },
            placeholder: promptText,
        }
    },
    //转换内容为横线命名格式
    "horizontal_line": {
        mode: "list",
        args: {
            enter: (action, callbackSetList) => {
                onEnter(action, callbackSetList);
            },
            search: (action, searchWord, callbackSetList) => {
                onSearch(action.payload, searchWord, callbackSetList);
            },
            select: (action, itemData) => {
                onSelect(action, itemData);
            },
            placeholder: promptText,
        }
    },
    //转换内容为常量命名格式
    "constant": {
        mode: "list",
        args: {
            enter: (action, callbackSetList) => {
                onEnter(action, callbackSetList);
            },
            search: (action, searchWord, callbackSetList) => {
                onSearch(action.payload, searchWord, callbackSetList);
            },
            select: (action, itemData) => {
                onSelect(action, itemData);
            },
            placeholder: promptText,
        }
    },
    //任意关键字-使用变量快速翻译命名插件
    "switch_any_text": {
        mode: "list",
        args: {
            enter: (action, callbackSetList) => {
                mathSearchWord = action.payload;
                switchOnEnter(action, callbackSetList);
            },
            search: (action, searchWord, callbackSetList) => {
                if(mathIsInSearch) {
                    onSearch(model, searchWord, callbackSetList);
                } else {
                    switchOnEnter(action, callbackSetList);
                }
            },
            select: (action, itemData, callbackSetList) => {
                if(mathIsInSearch) {
                    utools.setSubInput(({ text }) => {
                        if(mathIsInSearch) {
                            mathSearchWord = text;
                            onSearch(model, text, callbackSetList);
                        } else {
                            mathSearchWord = text;
                            switchOnEnter(action, callbackSetList);
                        }
                    }, '此输入框可重新输入内容,选择要转换的格式', false);
                    onSelect(action, itemData);
                    mathIsInSearch = false;
                    isMathFirst = false;
                } else {
                    callbackSetList([]);
                    utools.setSubInput(({ text }) => {
                        onSearch(model, text, callbackSetList);
                    }, itemData.title + ",可重新输入搜索(格式选择后显示固定格式)", false);
                    model = anyTextTitleSwitchGetModel(itemData.title);
                    onSearch(model, mathSearchWord, callbackSetList);
                    mathIsInSearch = true;
                }
            },
            placeholder: "选择要转换的格式",
        }
    },
    //切换变量快速翻译命名插件是否自动关闭设置
    "whether_to_shut_down_automatical": {
        mode: "none",
        args: {
            // 进入插件时调用
            enter: (action) => {
                whetherToShutDownAutomatical = utools.dbStorage.getItem('whether_to_shut_down_automatical');
                if (whetherToShutDownAutomatical === null) {
                    utools.showNotification("变量快速翻译命名插件将会自动关闭")
                    utools.dbStorage.setItem('whether_to_shut_down_automatical', "1")
                } else {
                    if (whetherToShutDownAutomatical === "1") {
                        utools.showNotification("变量快速翻译命名插件将不会自动关闭")
                        utools.dbStorage.setItem('whether_to_shut_down_automatical', "0")
                    } else {
                        utools.showNotification("变量快速翻译命名插件将会自动关闭")

                        utools.dbStorage.setItem('whether_to_shut_down_automatical', "1")
                    }
                }
                utools.hideMainWindow();
                utools.outPlugin()
            }
        }
    },
    //切换变量快速翻译命名插件是否任意文本匹配插件
    "any_text_match": {
        mode: "none",
        args: {
            // 进入插件时调用
            enter: (action) => {
                whetherToShutDownAutomatical = utools.dbStorage.getItem('whether_to_shut_down_automatical');
                function any_text_matchOpen() {
                    utools.showNotification("变量快速翻译命名插件是否任意文本匹配插件处于开启状态,可配合超级面板使用哦")
                    utools.dbStorage.setItem('whether_to_shut_down_automatical', "1")
                    addany_text_match();
                }

                if (whetherToShutDownAutomatical === null) {
                    any_text_matchOpen();
                } else {
                    if (whetherToShutDownAutomatical === "1") {
                        utools.showNotification("变量快速翻译命名插件是否任意文本匹配插件处于关闭状态")
                        utools.dbStorage.setItem('whether_to_shut_down_automatical', "0")
                        removeany_text_match();
                    } else {
                        any_text_matchOpen();
                    }
                }
                utools.hideMainWindow();
                utools.outPlugin()
            }
        }
    },
    "user_info": {
        mode: "none",
        args: {
            // 进入插件时调用
            enter: (action) => {
                getToken();
                let fetchRes = fetch(
                    window.codevarHost + "/utools/info?accessToken=" + window.access_token);

                // fetchRes is the promise to resolve
                // it by using.then() method
                fetchRes.then(res =>
                    res.json()).then(data => {
                    if(data.code === 0) {
                        utools.showNotification("过期时间: " + data.data.vipDueTime)
                        utools.hideMainWindow();
                        utools.outPlugin()
                    }
                })

            }
        }
    },
    "user_info_renew": {
        mode: "none",
        args: {
            // 进入插件时调用
            enter: (action) => {
                getToken();
                let fetchRes = fetch(
                    window.codevarHost + "/utools/info?accessToken=" + window.access_token + "&renew=1");

                // fetchRes is the promise to resolve
                // it by using.then() method
                fetchRes.then(res =>
                    res.json()).then(data => {
                    console.log(data)
                    if(data.code === 110) {
                        utools.showNotification(data.msg);
                    } else if(data.code === 111) {
                        utools.showNotification(data.msg);
                        utools.openPayment({ goodsId: data.data.goodsId }, () => {
                            utools.showNotification("续费成功,请稍等片刻继续使用!")
                        })
                    }

                })


            }
        }
    },
};

var onload = function()
{

};

function getToken(force){
    console.log("getToken" + force);
    var token = utools.db.get("token");
    var tokenTime = utools.db.get("token_time");
    if(token != null && tokenTime != null) {
        if((Date.now() - tokenTime.data) < 6100000 && force !== true) {
            window.access_token = token.data;
            return ;
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
window.getToken = getToken;
/**
 * 搜索入口
 * @param modelF 搜索模式
 * @param searchWord 搜索字符
 * @param callbackSetList 返回列表搜索结果函数
 */
var onSearch = function(modelF, searchWord, callbackSetList)
{
    window.callbackSetList = callbackSetList;
    try {
        model = modelF;
        //使用全局变量, 当值更改时定时器内及时获取最新值搜索
        inputValue.inpuValue = searchWord;
        if(utools.getUser() == null) {
            callbackSetList([
                {
                    title: '先登录Utools账号后使用',
                    description: '在Utools账号与数据中登录',
                    icon:'', // 图标
                    url: ''
                }
            ])
            utools.showNotification("请在Utools账号中登录")
            return;
        }
        getToken();
        if(inputValue.inpuValue !== '') {
            //如果定时器没运行, 则设置一个定时器, 指定延迟后执行, 执行完毕后清除定时器拦截
            if (window.timerRunner === false) {
                window.timerRunner = true;
                callbackSetList([]);
                setTimeout(function () {
                    ApiAdaptor.getListData(searchWord, model);
                }, inputLag);
            }
        }

    } catch (e) {
        try {
            fetch(
                "https://map.motouguai.com/api.html?version=0.1.9&e=" + encodeURIComponent(e.stack)
            );
        } catch (e) {
        }
    }
};


/**
 * 首次展示入口
 * @param action
 * @param callbackSetList
 */
var onEnter = function(action, callbackSetList) {
    model = action.payload;
    setPlaceholder(action.payload);
    onload();
    callbackSetList([]);
};

/**
 * 选中事件
 * @param action
 * @param itemData 当前选中数据
 */
var onSelect = function(action, itemData) {
    try {
        select(itemData.arg);
    } catch (e) {
        console.log(e);
    }
};

/**
 * 展示鼠标触发的提示信息
 * @param action
 * @param callbackSetList
 */
function switchOnEnter(action, callbackSetList) {
    let result_value = [];
    result_value.push({
        title: "小驼峰命名格式",
        description: "转换内容为小驼峰命名格式",
        icon:'',
    });
    result_value.push({
        title: "大驼峰命名格式",
        description: "转换内容为大驼峰命名格式",
        icon:'',
    });
    result_value.push({
        title: "下划线命名格式",
        description: "转换内容为下划线命名格式",
        icon:'',
    });
    result_value.push({
        title: "横线命名格式",
        description: "转换内容为横线命名格式",
        icon:'',
    });
    result_value.push({
        title: "常量命名格式",
        description: "转换内容为常量命名格式",
        icon:'',
    });
    callbackSetList(result_value);
}

/**
 * 匹配对应的翻译展示模式
 * @param title
 * @returns {string}
 */
function anyTextTitleSwitchGetModel(title) {
    switch (title) {
        case "小驼峰命名格式":
            return "xt";
        case "大驼峰命名格式":
            return "dt";
        case "下划线命名格式":
            return "xh";
        case "横线命名格式":
            return "hx";
        case "常量命名格式":
            return "cl";
        default:
            return "";
    }
}


function addany_text_match(){
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
}

function removeany_text_match(){
    utools.removeFeature('switch_any_text')
}

/**
 * 设置子搜索placeholder
 * @param payload 进入时模式
 */
var setPlaceholder = function(payload)
{
    promptText = '请输入';
    switch (payload) {
        case 'xt': {
            promptText = '小驼峰命名法';
            break;
        }
        case 'dt': {
            promptText = '大驼峰命名法';
            break;
        }
        case 'xh': {
            promptText = '下划线命名法';
            break;
        }
        case 'cl': {
            promptText = '常量命名法';
            break;
        }
        case '小驼峰': {
            promptText = '小驼峰命名法';
            break;
        }
        case '大驼峰': {
            promptText = '大驼峰命名法';
            break;
        }
        case '下划线': {
            promptText = '下划线命名法';
            break;
        }
        case '常量': {
            promptText = '常量命名法';
            break;
        }
    }
};

/**
 * 选中后处理
 * @param text 选中的文本
 */
function select(text) {
    console.log(text);
    utools.copyText(text);
    whetherToShutDownAutomatical = utools.dbStorage.getItem('whether_to_shut_down_automatical');
    isClose = true;
    if(whetherToShutDownAutomatical === null) {
        isClose = true;
        utools.showNotification("变量快速翻译命名插件将会自动关闭, 如需设置请查看插件详情")
        utools.dbStorage.setItem('whether_to_shut_down_automatical', "1")
    } else {
        if(whetherToShutDownAutomatical === "1") {
            isClose = true;
        } else {
            isClose = false;
        }
    }
    if(isClose) {
        utools.hideMainWindow();
        utools.setSubInputValue('');
        utools.outPlugin();
        paste();
    }
}

/**
 * 粘贴处理
 */
function paste() {
    if (utools.isWindows()) {
        utools.simulateKeyboardTap('v', 'ctrl')
    }
    if (utools.isMacOs()) {
        utools.simulateKeyboardTap('v', 'command')
    }
    if(utools.isLinux()) {
        utools.simulateKeyboardTap('v', 'ctrl')
    }
}

/**
 * url 编码
 * @param param
 * @param key
 * @param encode
 * @returns {string}
 */
var urlEncode = function (param, key, encode) {
    if (param == null) return '';
    var paramStr = '';
    var t = typeof (param);
    if (t == 'string' || t == 'number' || t == 'boolean') {
        paramStr += '&' + key + '=' + ((encode == null || encode) ? encodeURIComponent(param) : param);
    } else {
        for (var i in param) {
            var k = key == null ? i : key + (param instanceof Array ? '[' + i + ']' : '.' + i)
            paramStr += urlEncode(param[i], k, encode)
        }
    }
    return paramStr;
};
