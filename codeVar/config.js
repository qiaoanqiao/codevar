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
};
module.exports = config;