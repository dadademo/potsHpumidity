const http = require('http');
const os = require('os');
const urlInfo = require('url')
// 读取数据库
const querystring = require("querystring")
var sqlite3 = require('sqlite3').verbose()

// 要使用的端口号
const PORT_NUMBER = 3001


var db = new sqlite3.Database('./temp.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        return console.log(err.message)
    }
    console.log('数据库链接成功')
})

/** 追加信息 */
const appendTemp = (temp) => {
    return new Promise((resolve, reject) => {
        const currentTime = new Date().getTime()
        const addData = `INSERT INTO temp (time,temp)  VALUES(${currentTime},${temp})`
        db.run(addData, function (err, data) {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve()
        })
    })

}

const selectTemp = (paramInfo) => {
    return new Promise((resolve, reject) => {
        const { pageIndex = 1, pageSize = 10, all = false,startTimestamp,endTimestamp } = paramInfo
        let sqlStr = `select * from temp`
        if (startTimestamp && endTimestamp) {
            sqlStr = `select * from temp where time >= ${startTimestamp} and time <= ${endTimestamp}`
        }
        // 默认展示所有
        if (all === false) {
            sqlStr += ` limit(${(pageIndex - 1) * pageSize}),${pageSize}`
        }
        db.all(sqlStr, function (err, data) {
            if (err) {
                return console.log(err)
            }
            resolve(data)
        })
    })
}


// 2. 创建服务
// req(request):本次请求  res(response):本次响应     每次收到浏览器的请求,它就会执行一次回调
const server = http.createServer(function (req, res) {
    const { method, url } = req
    // 接收到请求数据
    if (method === 'POST' && url === '/sendCurrentTemp') {
        //创建空字符叠加数据片段
        var data = '';
        //2.注册data事件接收数据（每当收到一段表单提交的数据，该方法会执行一次）
        req.on('data', (chunk) => {
            // chunk 默认是一个二进制数据，和 data 拼接会自动 toString
            data += chunk;
        })
        req.on('end', () => {
            try {
                console.log(data)
                const info = JSON.parse(data)
                appendTemp(info.temp)
                res.end('{status:200}');
            } catch (e) {
                console.error(e)
            }
        })
    }
    const { pathname, path } = urlInfo.parse(req.url)
    if (method === 'GET' && pathname === '/getTemp') {
        // 返回查询的信息
        selectTemp(param2Obj(path)).then(list => {
            let retObj = {
                status: 200,
                list
            }
            res.end(JSON.stringify(retObj));
        })
    }

    // 获取数据请求
});


// 3. 启动服务
server.listen(PORT_NUMBER, function () {
    console.log(`服务器启动成功，请在http://${getIpAddress()}:${PORT_NUMBER}中访问....`)
});


/** 获取当前ip地址 */
function getIpAddress() {
    var ifaces = os.networkInterfaces()
    for (var dev in ifaces) {
        let iface = ifaces[dev]
        for (let i = 0; i < iface.length; i++) {
            let { family, address, internal } = iface[i]
            if (family === 'IPv4' && address !== '127.0.0.1' && !internal) {
                return address
            }
        }
    }
}


function param2Obj(url) {
    const search = url.split('?')[1]
    if (!search) {
        return {}
    }
    const paramObj = JSON.parse('{"' + (search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}')
    Object.keys(paramObj).map(key => {
        paramObj[key] = decodeURIComponent(paramObj[key])
    })
    return paramObj
}
