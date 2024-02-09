

// this should store in file or databse


const ffmpeg = require('fluent-ffmpeg');
const timers = require('timers-promises')

const ServiceStatue = {
    Setup: "Setup",
	Connecting: "Connecting",
	Active: "Active",
	NoSignal: "NoSignal",
	End: "End"
}

var initID = 0

// schema
/*
{ 
    "id": ID
    "name": "Service Name",
    "status": ServiceStatue,
    "url": "rtsp://<username>:<password>@zephyr.rtsp.stream/movie"
    "ffmpeg": ffmpeg instance,
    "active": bool, it will not connect when inactive
    "timeout" when this = 0, setup again
}
*/
var services = [

];

// Internal port for ffmpeg publish stream to rtsp server
const rtspServerPort = 5554

exports.ServiceStatue = ServiceStatue

exports.port = rtspServerPort
  
exports.list = function(){
    let serviceList = services.map((service) => {
        rv = {
            "id": service.id,
            "name": service.name,
            "status": service.status
        }
        return rv;
    })
    return serviceList
}
  
exports.add = function(name, url){
    let serviceID = initID++
    let service = { 
        "id": serviceID,
        "name": name,
        "status": ServiceStatue.Setup,
        "url": url,
        "active": true,
        "timeout": 0
    }
    services.push(service)
};

async function setup(id) {
    let service = services[id]
    // setup ffmpeg routing from any url as rtsp publisher
    console.log(`Setup Service: ${id} with status: ${service.status}`);
    services[service.id].status = ServiceStatue.Connecting;
    services[service.id].timeout = -1;
    service.ffmpeg = new ffmpeg()
    await service.ffmpeg.input(`${service.url}`).withNoAudio().format("rtsp")
        .output(`rtsp://127.0.0.1:${rtspServerPort}/${service.id}`).videoCodec(`copy`)
        .on('start', function(commandLine) {
            console.log(`Spawned ${service.id} with command: ${commandLine}`);
            services[service.id].status = ServiceStatue.Connecting;
          })
        .on('error', function(err, stdout, stderr) {
            console.log('Cannot process video: ' + err.message);
            services[service.id].status = ServiceStatue.NoSignal;
            services[service.id].timeout = 10;  // restart after 10 second
          })
        .on('progress', function(progress) {
            services[service.id].status = ServiceStatue.Active;
            //console.log('Processing: ' + progress.percent + '% done');
          })
        .on('end', function() {
            console.log('Finished processing');
            services[service.id].status = ServiceStatue.End;
          }).run();
}
  
// return service object per id
exports.get = function(id){
    let rv;
    services.forEach((service) => {
        if (service.id == id) {
            rv = {
                "id": service.id,
                "name": service.name,
                "status": service.status
            };
        }
    })
    return rv;
};

async function monitioring() {
    while(true) {
        services.forEach(async (service) => {
            if (service.active) {
                let status = service.status
                if (status == ServiceStatue.Setup || status == ServiceStatue.NoSignal) {
                    if (service.timeout === 0) {
                        await setup(service.id);
                    }
                    if (service.timeout > 0) {
                        services[service.id].timeout--
                    }   
                }
            }
        })
        await timers.setTimeout(1000)
    }
};

monitioring();
