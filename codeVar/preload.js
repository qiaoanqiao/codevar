let userInput = ''; //用户输入的内容
var model; //用户选择的模式
var timerRunner = false; //需要抢夺的定时器
var renderData = []; //返回内容
var thisKey = 0; //当前选择列
var dataCount = 0; //翻译结果数量
const { clipboard } = require('electron');

var notice = function (body) {
    let myNotification = new Notification('标题', {
        body: body
    })
};


var config = {
    youDaoApi: 'http://fanyi.youdao.com/openapi.do',
    params: {
        query: {
            keyfrom: 'CoderVar',
            key: '802458398',
            type: 'data',
            doctype: 'json',
            version: '1.1',
            q: '',
        }
    },
    filter: {
        prep: [
            'and', 'or', 'the', 'a', 'at', 'of'
        ],
        prefix: [],
        suffix: [
            'ing', 'ed', 'ly'
        ],
        verb: [
            'was'
        ]
    }
}

function translationFilter(str) {
    return str.split(' ')
}

function dtFilter(str) {
    var strArr = translationFilter(str);
    // 首单词首小写
    strArr[0] = strArr[0].toLowerCase();
    strArr[0] = strArr[0].charAt(0).toUpperCase() + strArr[0].substring(1);
    // 单词首字母大写
    for (let i = 1; i < strArr.length; i++) {
        strArr[i] = strArr[i].charAt(0).toUpperCase() + strArr[i].substring(1);
    }
    return strArr.join('');

}

function xtFilter(str) {
    var strArr = translationFilter(str);
    // 首单词首小写
    strArr[0] = strArr[0].toLowerCase();
    // 单词首字母大写
    for (let i = 1; i < strArr.length; i++) {
        strArr[i] = strArr[i].charAt(0).toUpperCase() + strArr[i].substring(1);
    }
    return strArr.join('');

}

function clFilter(str) {
    var strArr = translationFilter(str);
    for (let i = 0; i < strArr.length; i++) {
        strArr[i] = strArr[i].toUpperCase();
    }
    return strArr.join('_');

}

function xhFilter(str) {
    var strArr = translationFilter(str);
    for (let i = 0; i < strArr.length; i++) {
        strArr[i] = strArr[i].toLowerCase();
    }
    return strArr.join('_');
}

var style = function (str) {
    let strArr = str.toLowerCase();
    str = str.replace(/^(and|or|the|at|of|was)/igu, ' ');
    str = str.replace(/(ing|ed|ly)$/igu, '');
    switch (model) {
        case 'xt': {
            str = xtFilter(str);
            break;
        }
        case 'dt': {
            str = dtFilter(str);
            break;
        }
        case 'xh': {
            str = xhFilter(str);
            break;
        }
        case 'cl': {
            str = clFilter(str);
            break;
        }
    }
    return str;
};
utools.onPluginEnter(({code, type, payload}) => {
    model = payload;
    utools.setExpendHeight(500);
    var promptText = '';
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
var listDom = [];
var registerKeyDown = false;
var keyboard = function () {
    $("#var-list").find("li").each(function (key, value) {
        value.onclick = function(){
            enter(key);
        };
    });
    if(registerKeyDown === false) {
        document.addEventListener('keydown', event => {
            var keyCode = window.event ? event.keyCode : event.which;
            console.log(keyCode);
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
                downMove();
                return false;
            }
            if (keyCode === 38) {
                // console.log('按了上键');
                upMove();
                return false;

            }
            if (keyCode === 13) {
                // console.log('按了回车');
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
    var queryStr = urlEncode(config.params.query);
    url = config.youDaoApi + '?' + queryStr.slice(1);

    $.get(url, function (data) {
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
    });

}

var firstDown = true;
/**
 * dom 元素重载
 */
function domReload()
{
    firstDown = true;
    $("#var-list").empty();
    thisKey = 0;
    if(dataCount === 0) {
        utools.setExpendHeight(10);
        $("#noneData").removeClass("none");
    } else {
        $("#noneData").attr("class", "none");
    }
    keyboard();
}

function toReduceListOne() {
    if(firstDown) {
        thisKey = 0;
        window.scrollTo(0, document.body.scrollHeight);
        firstDown = false;
        return thisKey;
    }
    if(thisKey <= 0) {
        thisKey = dataCount - 1;
        window.scrollTo(0, document.body.scrollHeight);
        return thisKey;
    }
    if(thisKey < 5) {
        window.scrollTo(0, 0);
    }
    thisKey = thisKey -1;
    return thisKey;

}

function toAddListOne() {
    if(firstDown) {
        thisKey = 0;
        window.scrollTo(0, 0);
        firstDown = false;
        return thisKey;
    }
    if(thisKey >= (dataCount - 1)) {
        thisKey = 0;
        window.scrollTo(0,0);
        return thisKey;
    }
    if(thisKey === 0) {
        window.scrollTo(0,0);
    }
    if(thisKey > 4) {
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

function enter(key) {
    if(key) {
        var text = listDom[key].getAttribute('arg');
    } else {
        var text = listDom[thisKey].getAttribute('arg');
    }

    console.log(text);
    clipboard.writeText(text, 'selection');
    utools.hideMainWindow();
}

function domRendering(renderData) {
    for (var i = 0; i < renderData.length; i = i+1) {
        var list = document.getElementById('var-list');
        var htmlliElement = document.createElement('li');
        var anchorElement = document.createElement('a');
        var spanElement = document.createElement('span');
        anchorElement.src = '#';
        anchorElement.text = renderData[i]['title'];
        anchorElement.setAttribute("arg", renderData[i]['title']);;
        anchorElement.classList.add('translationDom');
        // if (i === 0) {
        //     anchorElement.classList.add('movelist');
        // }
        spanElement.innerHTML = renderData[i]['subtitle'];
        anchorElement.appendChild(spanElement);
        htmlliElement.appendChild(anchorElement);
        list.appendChild(htmlliElement);
    }
}

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
}

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
}




