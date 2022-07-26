
// 此 key 全采集于 github 上面 若有冒犯就先谢罪了啊哈...
const FIXED_KEY = [
    {
        keyfrom: 'whatMean',
        key: '1933652137'
    },
    {
        keyfrom: 'chinacache',
        key: '1247577973'
    },
    {
        keyfrom: 'huipblog',
        key: '439918742'
    },
    {
        keyfrom: 'fanyi-node',
        key: '593554388'
    },
    {
        keyfrom: 'wbinglee',
        key: '1127870837'
    },
    {
        keyfrom: 'forum3',
        key: '1268771022'
    },
    {
        keyfrom: 'node-translator',
        key: '2058911035'
    },
    {
        keyfrom: 'kaiyao-robot',
        key: '2016811247'
    },
    {
        keyfrom: 'stone2083',
        key: '1576383390'
    },
    {
        keyfrom: 'myWebsite',
        key: '423366321'
    },
    {
        keyfrom: 'leecade',
        key: '54015339'
    },
    {
        keyfrom: 'github-wdict',
        key: '619541059'
    },
    {
        keyfrom: 'lanyuejin',
        key: '2033774719'
    },
];



var config = {
    youDaoApi: 'http://fanyi.youdao.com/openapi.do',
    key_step: 0,
    retry_max: FIXED_KEY.length,//最大重试次数
    setNewKey:function(){
        config.key_step += 1;
        //防止超出索引引发的错误
        if(config.key_step>=FIXED_KEY.length)
        {
            config.key_step =0;
        }
        config.params.query.keyfrom = FIXED_KEY[config.key_step].keyfrom;
        config.params.query.key = FIXED_KEY[config.key_step].key;
        console.log(config.params);

    },
    params: {
        query: {
            keyfrom: 'CoderVar',
            key: '802458398',
            type: 'data',
            doctype: 'json',
            version: '1.1',
            // q: '',
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
};
module.exports = config;