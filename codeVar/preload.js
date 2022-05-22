var timerRunner = false; //需要抢夺的定时器
const {clipboard} = require('electron');
const convert = require('./function/convert.js');
const config = require('./config.js');
var switchInText = "";
var userAction = {
    auto_shutdown:1,
    auto_keyboard_shortcuts:1,
};
var model = '';
var promptText = '请输入要转化的文字';
var inputValue = '';
//输入延迟
var inputLag = 350;
var mathSearchWord = "";
var mathIsInSearch = false;
var isMathFirst = true;


var onSearch = function(modelF, searchWord, callbackSetList)
{
    try {
        model = modelF;
        inputValue = searchWord;
        let selectData = [];
        if(inputValue !== '') {
            if (timerRunner === false) {
                callbackSetList([]);
                timerRunner = true;
                setTimeout(function () {
                    timerRunner = false;
                    selectData = getListData(modelF);
                    callbackSetList(selectData)
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

var onEnter = function(action, callbackSetList) {
    model = action.payload;
    setPlaceholder(action.payload);
    callbackSetList([]);
};

var onSelect = function(action, itemData) {
    try {
        enter(itemData.arg);
    } catch (e) {
        fundebug.notifyError(e);
    }
};

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

function titleSwitchGetModel(title) {
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

window.exports = {
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
                console.log("select");
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
                    model = titleSwitchGetModel(itemData.title);
                    onSearch(model, mathSearchWord, callbackSetList);
                    mathIsInSearch = true;
                }
            },
            placeholder: "选择要转换的格式",
        }
    },
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
};

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


var urlEncode = function(param, key, encode) {
    if (param==null) return '';
    var paramStr = '';
    var t = typeof (param);
    if (t == 'string' || t == 'number' || t == 'boolean') {
        paramStr += '&' + key + '='  + ((encode==null||encode) ? encodeURIComponent(param) : param);
    } else {
        for (var i in param) {
            var k = key == null ? i : key + (param instanceof Array ? '[' + i + ']' : '.' + i)
            paramStr += urlEncode(param[i], k, encode)
        }
    }
    return paramStr;
};

/**
 * 获取处理后的列表数据.
 * @returns {Array}
 */
var getListData = function()
{
    try {
        fetch(
            "https://map.motouguai.com/api.html?version=0.1.9"
        );
    } catch (e) {
    }
    let returnData = [];
    var url = config.youDaoApi;
    var stop = false;
    for (var i = 0; i<config.key_max_step; i++ ) {
        if((!stop) && (inputValue !== '')) {
            let xhr = null;
            if (window.XMLHttpRequest) {
                xhr = new XMLHttpRequest();
            } else {
                xhr = new ActiveXObject('MicroSoft.XMLHTTP');
            }
            stop = true;

            let youDaoApiUrl = url + '?' + urlEncode(config.params.query) + '&q=' + inputValue;
            xhr.open('GET', youDaoApiUrl, false);
            xhr.setRequestHeader('Accept', 'application/json');
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send();
            //6,通过状态确认完成
            if (xhr.readyState == 4 && xhr.status == 200) {
                timerRunner = false;
                //7,获取返回值，解析json格式字符串为对象
                try {
                    var data = JSON.parse(xhr.responseText);
                } catch (e) {
                    timerRunner = true;
                    stop = false;
                    if (!config.setNewKey()) {
                        stop = true;
                        utools.showNotification('哎呀, 翻译接口连接错误! 没办法翻译了!', null, false)
                    }
                    continue;
                }
                if (parseInt(data.errorCode) === 0) {
                    stop = true;
                    returnData = dataToProcess(data);
                } else {
                    stop = false;
                    if (!config.setNewKey()) {
                        stop = true;
                        utools.showNotification('哎呀, 没办法翻译了, 所有翻译 key 都无法使用!', null, false)
                    }
                }

            } else {
                if (!config.setNewKey()) {
                    stop = true;
                    utools.showNotification('哎呀, 翻译接口连接错误! 没办法翻译了!', null, false)
                }
            }
        }
    }

    return returnData;
};

/**
 * 格式化翻译字符
 * @param str
 * @returns {*}
 */
var style = function (str) {
    switch (model) {
        case 'xt': {
            str = convert.xtFilter(str);
            break;
        }
        case 'dt': {
            str = convert.dtFilter(str);
            break;
        }
        case 'xh': {
            str = convert.xhFilter(str);
            break;
        }
        case 'hx': {
            str = convert.hxFilter(str);
            break;
        }
        case 'cl': {
            str = convert.clFilter(str);
            break;
        }
        case '小驼峰': {
            str = convert.xtFilter(str);
            break;
        }
        case '大驼峰': {
            str = convert.dtFilter(str);
            break;
        }
        case '下划线': {
            str = convert.xhFilter(str);
            break;
        }
        case '横线': {
            str = convert.hxFilter(str);
            break;
        }
        case '常量': {
            str = convert.clFilter(str);
            break;
        }
    }
    return str;
};

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

function enter(text) {
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

/**
 * 接口返回数据过滤
 * @param result
 * @returns {Array}
 */
var dataToProcess = function (result) {
    //结果
    let result_value = [];
    // 过滤中文
    let reg = /^[a-zA-Z ]/;
    // 标准翻译结果 : translation
    let result_translation = result.translation;
    if (result_translation) {
        for (let i = 0, len = result_translation.length; i < len; i++) {
            if (reg.test(result_translation[i])) {
                result_value.push({
                    title: style(result_translation[i]),
                    description: `标准翻译 => ${result_translation[i]}`,
                    arg: style(result_translation[i]),
                    icon:'',
                });
            }
        }
    } else {
        return [];
    }
    // 网络翻译 : web
    if (result.web) {
        let result_web = result.web;
        if (result_web) {
            for (let i = 0, len = result_web.length; i < len; i++) {
                for (let j = 0, ilen = result_web[i].value.length; j < ilen; j++) {
                    if (reg.test(result_web[i].value[j])) {
                        result_value.push({
                            title: style(result_web[i].value[j]),
                            description: `网络翻译 => ${result_web[i].value[j]}`,
                            arg: style(result_web[i].value[j]),
                            icon:'',
                        });
                    }
                }
            }
        } else {
            result_value = [];
        }

    }

    return result_value;
};




