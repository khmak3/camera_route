const express = require('express');
const service = require('./service');
const rtspserver = require('rtsp-streaming-server').default;
const fs = require('fs');

// default service Config
const defaultServicesConfig = {
    "host": "127.0.0.1",
    "port": 19612,
    "rtspPort": 6554,
    "rtpPortStart": 10000,
    "rtpPortCount": 10000,
    "services": 
        [ 
            {
                "name": "Bunny",
                "url": "rtsp://rtspstream:45fb22c77de134324fa9f9e1dd2bbb1e@zephyr.rtsp.stream/movie"
            },{
                "name": "Color Bar",
                "url": "rtsp://rtspstream:bf8f0d443b174ac5576a3eaa456f38c6@zephyr.rtsp.stream/pattern"
            }
        ]
    };

var config = defaultServicesConfig;

// List all config service include it's status
function servicelist (req, res) {
    serList = service.list()
    //serviceList = services.map((service) => {return service.name})
    serLis = serList.map((service) =>{
        service.url = `http://${config.host}:${config.port}/service/${service.id}`

    })
   
    res.send(`${JSON.stringify(serList)}`)
}

// list service by id with rtsp stream
function serviceRtsp (req, res) {
    reqid = req.params.id
    serv = service.get(reqid)
    replyObj = {
        "ServiceID": reqid, 
        "Status": "Not Exist",
    };
    reply = `{"ServiceID": "${reqid}", "Status": "Not Exist"}`
    if (serv) {
        replyObj.ServiceName = serv.name;
        replyObj.Status = serv.status;
        if (serv.status == service.ServiceStatue.Active) {
            replyObj.stream = `rtsp://${config.host}:${config.rtspPort}/${serv.id}`
        }
    }
    reply = JSON.stringify(replyObj)
    res.send(reply)
}

function getConfig() {
    let rv = defaultServicesConfig
    var obj = JSON.parse(fs.readFileSync('config.json', 'utf8'));
    console.log(obj)
    if (obj && obj.services && obj.services.length > 0) {
        rv = obj;
    } else {
        // use default config
        console.log("use default config")
        console.log(JSON.stringify(servicesConfig))
    }
    return rv
}

async function run () {
    try {
        app = express();         
        app.use(express.urlencoded({ extended: true }));
        app.use(express.json());

        config = getConfig();
        

        
        app.get('/',  
        (req, res) => res.send(`Use http://${config.host}:${config.port}/list to list all available service`));

        app.get('/list',  servicelist);
        
        app.get('/service/:id', serviceRtsp);
   

        app.listen(config.port,  
            () => console.log(`⚡️[bootup]: Server is running at port: 19612`));
        const server = new rtspserver({
            serverPort: service.port,
            clientPort: config.rtspPort,
            rtpPortStart: config.rtpPortStart,
            rtpPortCount: config.rtpPortCount,
        });
        await server.start();
        console.log('setup service\n');
        config.services.forEach(function (ser) {
            console.log(`Add Service: ${ser.name}`)
            service.add(ser.name, ser.url)
        })
        
    } catch (e) {
        console.error(e);
    }
}
   
run();
