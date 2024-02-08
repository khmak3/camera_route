

// this should store in file or databse


const ffmpeg = require('fluent-ffmpeg');

const ServiceStatue = {
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
    "ffmpeg" ffmpeg instance
}
*/
var services = [

];

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
        "status": "Undefined",
        "url": url
    }
    service.ffmpeg = new ffmpeg()
    services.push(service)
    // setup ffmpeg routing from any url as rtsp publisher
    service.ffmpeg.input(`${service.url}`).format("rtsp")
        .output(`rtsp://127.0.0.1:${rtspServerPort}/${service.id}`).videoCodec(`copy`)
        .on('start', function(commandLine) {
            console.log(`Spawned ${service.id} with command: ${commandLine}`);
            services[service.id].status = ServiceStatue.Connecting;
          })
        .on('error', function(err, stdout, stderr) {
            console.log('Cannot process video: ' + err.message);
            services[service.id].status = ServiceStatue.NoSignal;
          })
        .on('progress', function(progress) {
            services[service.id].status = ServiceStatue.Active;
            //console.log('Processing: ' + progress.percent + '% done');
          })
        .on('end', function() {
            console.log('Finished processing');
            services[service.id].status = ServiceStatue.End;
          }).run();
};
  
// return service object per id
exports.get = function(id){
    let rv
    services.forEach((service) => {
        if (service.id == id) {
            rv = {
                "id": service.id,
                "name": service.name,
                "status": service.status
            }
        }
    })
    return rv;
};
