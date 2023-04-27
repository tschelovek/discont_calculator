const {existsSync, readFileSync, writeFileSync} = require('fs');
const {createServer} = require('http');

// файл для базы данных
const DB_FILE = process.env.DB_FILE || './db.json';
// номер порта, на котором будет запущен сервер
const PORT = process.env.PORT || 3069;
// префикс URI для всех методов приложения
const URI_PREFIX = '';

/**
 * Класс ошибки, используется для отправки ответа с определённым кодом и описанием ошибки
 */
class ApiError extends Error {
    constructor(statusCode, data) {
        super();
        this.statusCode = statusCode;
        this.data = data;
    }
}

if (!existsSync(DB_FILE)) {
    import('../vanilla/js/storage.js').then(res => {
        const {dataString} = res || '';

        writeFileSync(
            DB_FILE,
            JSON.stringify([
                {
                    flat: dataString,
                    flat_frame: modifyPriceListString(dataString, 1000),
                    flat_film: modifyPriceListString(dataString, 3000),
                    flat_frame_film: modifyPriceListString(dataString, 5000),
                    cassette: modifyPriceListString(dataString, 10000),
                    cassette_frame: modifyPriceListString(dataString, 20000),
                    cassette_film: modifyPriceListString(dataString, 30000),
                    cassette_frame_film: modifyPriceListString(dataString, 40000),
                },
            ]),
            {encoding: 'utf8'})
    })
}

function modifyPriceListString(string, modifier) {
    return string.split('|').reduce((accumulator, current, index) => {
        let temp = current.split('-');
        if (index === 0) return accumulator.concat(`${temp[0]}-${temp[1]}-${parseInt(temp[2]) + modifier}`);
        return accumulator.concat(`|${temp[0]}-${temp[1]}-${parseInt(temp[2]) + modifier}`)
    }, '')
}

function getPrices(params) {
    const prices = JSON.parse(readFileSync(DB_FILE) || '[]');
    if (params) { return prices[0][params] }
    return prices
}

module.exports = createServer(async (req, res) => {

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // запрос с методом OPTIONS может отправлять браузер автоматически для проверки CORS заголовков
    // в этом случае достаточно ответить с пустым телом и этими заголовками
    if (req.method === 'OPTIONS') {
        // end = закончить формировать ответ и отправить его клиенту
        res.end();
        return
    }
    // console.log(`req.url: ${req.url}`)

    // если URI не начинается с нужного префикса - можем сразу отдать 404
    // if (!req.url || !req.url.startsWith(URI_PREFIX)) {
    //     res.statusCode = 404;
    //     res.end(JSON.stringify({message: 'Not Found'}));
    //     return;
    // }

    const [uri, query] = req.url.substring(URI_PREFIX.length).split('?');
    console.log(`uri: ${uri}`)
    const queryParams = {};

    if (query) {
        for (const piece of query.split('&')) {
            const [key, value] = piece.split('=');
            queryParams[key] = value ? decodeURIComponent(value) : '';
        }
    }

    try {
        const body = await (async () => {
            if (uri === '' || uri === '/') {
                if (req.method === 'GET') return getPrices();
            } else {
                const itemId = req.url.substring(1);
                if (req.method === 'GET') return getPrices(itemId);
            }
            return null;
        })();
        res.end(JSON.stringify(body));
    } catch (err) {
        if (err instanceof ApiError) {
            res.writeHead(err.statusCode);
            res.end(JSON.stringify(err.data));
        } else {
            res.statusCode = 500;
            res.end(JSON.stringify({message: 'Server Error'}));
            console.error(err);
        }
    }
})
    .on('listening', () => {
        if (process.env.NODE_ENV !== 'test') {
            console.log('Нажмите CTRL+C, чтобы остановить сервер');
        }
    })
    .listen(PORT);
