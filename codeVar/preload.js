let userInput = ''; //用户输入的内容
var model; //用户选择的模式
var timerRunner = false; //需要抢夺的定时器
var renderData = []; //返回内容
var thisKey = 0; //当前选择列
var dataCount = 0; //翻译结果数量

const {clipboard} = require('electron');
const convert = require('./function/convert.js');
const config = require('./config.js');

var auto_shutdown = 1;
var auto_keyboard_shortcuts = 1;

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
        case '常量': {
            str = convert.clFilter(str);
            break;
        }
    }
    return str;
};
utools.onPluginEnter(({code, type, payload}) => {
    model = payload;
    utools.setExpendHeight(500);
    var promptText = '';
    dbTask();
    switch (model) {
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
    }
    utools.setSubInput(({text}) => {
        userInput = text;
        if (timerRunner === false) {
            timerRunner = true;
            setTimeout(inputTimeout, 2000);
        }

    }, promptText);
});

var dbTask = async function()
{
    // let auto_shutdown_db = utools.db.get('auto_shutdown');
    // if(auto_shutdown_db === 0) {
    //     auto_shutdown = 0;
    // }
    // let auto_keyboard_shortcuts_db = utools.db.get('auto_keyboard_shortcuts');
    // if(auto_keyboard_shortcuts_db === 0) {
    //     auto_keyboard_shortcuts = 0;
    // }

    let use_number_db = utools.db.get('use_number');
    let use_number = 0;
    if( use_number_db !== null) {
        use_number = use_number_db.num + 1;
        utools.db.put({
            _id: "use_number",
            num: use_number,
            _rev:use_number_db._rev,
        });

    } else {
        utools.db.put({
            _id: "use_number",
            num: use_number,
        });
    }
};


var listDom = [];

//是否已经注册过键盘按下事件
var registerKeyDown = false;

/**
 * 重载滑过样式
 */
var reloadMoveStyle = function () {
    $("#var-list").find("li").each(function (key, value) {
        $(value).children("a").eq(0).removeClass('movelist');
    });
};
var isKeyDown = false; //是否处于键盘按下(是否可以进行鼠标滑动事件)
var keyDownTimer = function (time = 1000) {
    setTimeout(function () {
        if (isKeyDown === true) {
            isKeyDown = false;
        }
    }, time);
};
var isMouseenter = false;

function timest() {
    var tmp = Date.parse(new Date()).toString();
    tmp = tmp.substr(0, 10);
    return tmp;
}

/**
 * 键盘事件注册
 */
var keyboard = function () {
    $("#var-list").find("li").each(function (key, value) {
        $(value).click(function () {
            enter(key);
        });
        // $(value).onMouseMove()
        $(value).mouseenter(function () {
            if (isKeyDown === false && isMouseenter === true) {
                reloadMoveStyle();
                $(value).children("a").eq(0).addClass('movelist');
                thisKey = key;
            }
            isMouseenter = true;
        });
    });
    if (registerKeyDown === false) {
        document.addEventListener('keydown', event => {
            isKeyDown = true;
            keyDownTimer();
            var keyCode = window.event ? event.keyCode : event.which;
            //屏蔽 Alt+ 方向键 ←,方向键 →
            for (var i = 49; i < 58; i++) {
                if (keyCode === 16 && keyCode === i) {
                    console.log("你按下了shift+" + i);
                }
            }
            if ((keyCode === 37 || keyCode === 39)) {
                event.returnValue = false;
                return false;
            }
            if (keyCode === 40) {
                // console.log('按了下键');
                reloadMoveStyle();
                downMove();
                return false;
            }
            if (keyCode === 38) {
                reloadMoveStyle();
                upMove();
                return false;

            }
            if (keyCode === 13) {
                enter();
                return false;
            }
        });
        registerKeyDown = true;
    }

};


function inputTimeout() {
    if (timerRunner === true) {
        $("#noneData").removeClass("none");

        fanyi();
    }
}

/**
 * 进行网络翻译
 */
function fanyi() {
    config.params.query.q = userInput;
    var url = config.youDaoApi;
    var stop = false;
    for (var i = 0; i<config.key_max_step; i++ ) {
        if(!stop) {
            $.ajax({
                url: url,
                async:false,
                data: config.params.query,
                success: function (data) {
                    if(parseInt(data.errorCode) === 0) {
                        $("#noneData").attr("class", "none");
                        // console.log(data);
                        timerRunner = false;

                        renderData = dataToProcess(data);
                        dataCount = renderData.length;

                        domReload();
                        utools.setExpendHeight(600);
                        domRendering(renderData);

                        $("#var-list").find("li").find("a").each(function (key, value) {
                            listDom[key] = value;
                        });
                        stop = true;
                    } else {
                        stop = false;
                        if(!config.setNewKey()) {
                            stop = true;
                            utools.showNotification('哎呀, 没办法翻译了, 所有翻译 key 都无法使用!', null, false)
                        }
                    }

                },
                dataType: "json"
            });
        }

    }

}

var firstDown = true;

/**
 * dom 元素重载
 */
function domReload() {
    firstDown = true;
    $("#var-list").empty();
    thisKey = 0;
    if (dataCount === 0) {
        utools.setExpendHeight(10);
        $("#noneData").removeClass("none");
    } else {
        $("#noneData").attr("class", "none");
    }
    // keyboard();
}


function toReduceListOne() {
    $("#var-list").find("li").each(function (key, value) {
        $(value).removeClass('movelist');
    });
    if (firstDown && thisKey === 0) {
        thisKey = dataCount - 1;
        window.scrollTo(0, document.body.scrollHeight);
        firstDown = false;
        return thisKey;
    }
    if (thisKey <= 0) {
        thisKey = dataCount - 1;
        window.scrollTo(0, document.body.scrollHeight);
        return thisKey;
    }
    if (thisKey < 5) {
        window.scrollTo(0, 0);
    }
    thisKey = thisKey - 1;
    return thisKey;

}

function toAddListOne() {

    if (firstDown && thisKey === 0) {
        thisKey = 1;
        window.scrollTo(0, 0);
        firstDown = false;
        return thisKey;
    }
    if (thisKey >= (dataCount - 1)) {
        thisKey = 0;
        window.scrollTo(0, 0);
        return thisKey;
    }
    if (thisKey === 0) {
        window.scrollTo(0, 0);
    }
    if (thisKey > 4) {
        window.scrollTo(0, document.body.scrollHeight);
    }
    thisKey = thisKey + 1;

    return thisKey;
}

function downMove() {
    if (dataCount > 0) {
        listDom[thisKey].classList.remove('movelist');
        toAddListOne();
        listDom[thisKey].classList.add('movelist');
        // listDom[thisKey].click();
    }
}

function upMove() {
    if (dataCount > 0) {
        listDom[thisKey].classList.remove('movelist');
        toReduceListOne();
        listDom[thisKey].classList.add('movelist');
        // listDom[thisKey].click();
    }
}

/** * 是否为mac系统（包含iphone手机） * */
var isMac = function () {
    return /macintosh|mac os x/i.test(navigator.userAgent);
};


/** * 是否为windows系统 * */
var isWindows = function () {
    return /windows|win32/i.test(navigator.userAgent);
};

function enter(key) {
    var text = '';
    if (key) {
        text = listDom[key].getAttribute('arg');
    } else {
        text = listDom[thisKey].getAttribute('arg');
    }
    clipboard.writeText(text, 'selection');
    if(auto_shutdown === 1) {
        utools.hideMainWindow();
    }
    utools.setSubInputValue('');
    utools.outPlugin();
    if(auto_keyboard_shortcuts === 1) {
        if (isWindows()) {
            utools.robot.keyToggle("v", "down", "control");
            utools.robot.keyToggle("v", "up", "control");
        }
        if (isMac()) {
            utools.robot.keyToggle("v", "down", "command");
            utools.robot.keyToggle("v", "up", "command");
        }
        //linux
        if ((!isMac()) && (!isWindows())) {
            utools.robot.keyToggle("v", "down", "control");
            utools.robot.keyToggle("v", "up", "control");
        }
    }

    //二次打开剪切板有影响
    // clipboard.writeText('', 'selection');
}

/**
 * dom 重载显示
 * @param renderData
 */
function domRendering(renderData) {
    for (var i = 0; i < renderData.length; i = i + 1) {

        var list = document.getElementById('var-list');
        var htmlliElement = document.createElement('li');
        var anchorElement = document.createElement('a');
        var spanElement = document.createElement('span');
        if (i === 0) {
            anchorElement.className = 'movelist';
        }
        anchorElement.src = '#';
        anchorElement.text = renderData[i]['title'];
        anchorElement.setAttribute("arg", renderData[i]['title']);
        anchorElement.classList.add('translationDom');
        spanElement.innerHTML = renderData[i]['subtitle'];
        anchorElement.appendChild(spanElement);
        htmlliElement.appendChild(anchorElement);
        list.appendChild(htmlliElement);
    }
    keyDownTimer(1500);
    keyboard();
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
                    subtitle: `标准翻译 => ${result_translation[i]}`,
                    arg: style(result_translation[i]),
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
                            subtitle: `网络翻译 => ${result_web[i].value[j]}`,
                            arg: style(result_web[i].value[j]),
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




