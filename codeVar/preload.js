var timerRunner = false; //需要抢夺的定时器
const {clipboard} = require('electron');
const convert = require('./function/convert.js');
const config = require('./config.js');

var userAction = {
    auto_shutdown:1,
    auto_keyboard_shortcuts:1,
};
var model = '';
var promptText = '请输入要转化的文字';
var inputValue = '';
//输入延迟
var inputLag = 350;

var onload = function()
{
    var fundebug = require("fundebug-javascript");
    fundebug.apikey = "20634a54043152c8d1a3a92054ad2412a1af0a591aaf11ed21ee5d046b4cb8d0";
};

var onSearch = function(action, searchWord, callbackSetList)
{
    try {
        model = action.payload;
        inputValue = searchWord;
        let selectData = [];
        if(inputValue !== '') {
            if (timerRunner === false) {
                callbackSetList([]);
                timerRunner = true;
                setTimeout(function () {
                    timerRunner = false;
                    selectData = getListData(action.payload);
                    callbackSetList(selectData)
                }, inputLag);
            }
        }

    } catch (e) {
        console.log(e);
        fundebug.notifyError(e);
    }
};

var onEnter = function(action, callbackSetList) {
    model = action.payload;
    setPlaceholder(action.payload);
    onload();
    callbackSetList([]);
};

var onSelect = function(action, itemData) {
    try {
        enter(itemData.arg);
    } catch (e) {
        fundebug.notifyError(e);
    }
};

window.exports = {
    "big_hump": {
        mode: "list",
        args: {
            enter: (action, callbackSetList) => {
                onEnter(action, callbackSetList);
            },
            search: (action, searchWord, callbackSetList) => {
                onSearch(action, searchWord, callbackSetList);
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
                onSearch(action, searchWord, callbackSetList);
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
                onSearch(action, searchWord, callbackSetList);
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
                onSearch(action, searchWord, callbackSetList);
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
                onSearch(action, searchWord, callbackSetList);
            },
            select: (action, itemData) => {
                onSelect(action, itemData);
            },
            placeholder: promptText,
        }
    },
};


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

                var data = JSON.parse(xhr.responseText);
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

/** * 是否为mac系统（包含iphone手机） * */
var isMac = function () {
    return /macintosh|mac os x/i.test(navigator.userAgent);
};


/** * 是否为windows系统 * */
var isWindows = function () {
    return /windows|win32/i.test(navigator.userAgent);
};

function enter(text) {
    clipboard.writeText(text, 'selection');
    if(userAction.auto_shutdown === 1) {
        utools.hideMainWindow();
    }
    utools.setSubInputValue('');
    utools.outPlugin();
    if(userAction.auto_keyboard_shortcuts === 1) {
        if (isWindows()) {
            utools.robot.keyToggle("v", "down", "control");
            utools.robot.keyToggle("v", "up", "control");
        }
        if (isMac()) {
            utools.robot.keyToggle("v", "down", "command");
            utools.robot.keyToggle("v", "up", "command");
        }
        //other
        if(!isMac() && !isWindows()) {
            utools.robot.keyToggle("v", "down", "control");
            utools.robot.keyToggle("v", "up", "control");
        }


    }

    //二次打开剪切板有影响
    // clipboard.writeText('', 'selection');
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




