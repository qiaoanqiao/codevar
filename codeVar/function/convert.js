var convert = {
    dtFilter(str) {
        var strArr = translationFilter(str);
        // 首单词首小写
        strArr[0] = strArr[0].toLowerCase();
        strArr[0] = strArr[0].charAt(0).toUpperCase() + strArr[0].substring(1);
        // 单词首字母大写
        for (let i = 1; i < strArr.length; i++) {
            strArr[i] = strArr[i].charAt(0).toUpperCase() + strArr[i].substring(1);
        }
        return strArr.join('');

    },

    xtFilter(str) {
        var strArr = translationFilter(str);
        // 首单词首小写
        strArr[0] = strArr[0].toLowerCase();
        // 单词首字母大写
        for (let i = 1; i < strArr.length; i++) {
            strArr[i] = strArr[i].charAt(0).toUpperCase() + strArr[i].substring(1);
        }
        return strArr.join('');

    },

    clFilter(str) {
        var strArr = translationFilter(str);
        for (let i = 0; i < strArr.length; i++) {
            strArr[i] = strArr[i].toUpperCase();
        }
        return strArr.join('_');

    },

    xhFilter(str) {
        var strArr = translationFilter(str);
        for (let i = 0; i < strArr.length; i++) {
            strArr[i] = strArr[i].toLowerCase();
        }
        return strArr.join('_');
    },
    hxFilter(str) {
        var strArr = translationFilter(str);
        for (let i = 0; i < strArr.length; i++) {
            strArr[i] = strArr[i].toLowerCase();
        }
        return strArr.join('-');
    },

};
function translationFilter(str) {
    str = str.replace(/( and | or | the | at | of | was | a )/igu, ' ');
    str = str.replace(/(\s?ing|\s?ed|\s?ly)$/igu, '');
    str = str.replace(/^(the )/igu, '');

    return str.split(' ')
}

module.exports = convert;