# RTSP Camera RTSP router 

This is a RESTful server utilizing the ExpressJS framework to facilitate accessing video streams from an RTSP camera.

This is a Docker container-based solution that requires the host network driver to receive RTSP push from the camera.
```
The host networking driver only works on Linux hosts, and is not supported on Docker for Mac, Docker for Windows, or Docker EE for Windows Server.
So, we need other installation procedure to run locally
```
The server provides the following functionality:

## List all services
- GET list (default: http://127.0.0.1:19612/list)
- It will output services JSON list

```javascript 
[
    {
        "id":"<service id - assign by system>",
        "name":"<service name>",
        "status":"<service status - 'Setup','Connecting','Active','NoSignal','End'>",
        "url":"<Access detail service info include rtsp>:
    }
]

//example:
[
    {"id":0,"name":"Bunny","status":"Active","url":"http://127.0.0.1:19612/service/0"},
    {"id":1,"name":"Color Bar","status":"Active","url":"http://127.0.0.1:19612/service/1"},
    {"id":2,"name":"Invalid","status":"Connecting","url":"http://127.0.0.1:19612/service/2"}
]
```

## Access service detail
- GET service/:id (default: http://127.0.0.1:19612/service/0)
- Outputs detailed service information in JSON format.

```javascript
{
    "ServiceID":"<service id>",
    "Status":"<service status - 'Setup','Connecting','Active','NoSignal','End'>","ServiceName":"<service name>",
    "stream":"<rtsp url to access the video forward by service>"
}

//example:
{"ServiceID":"0","Status":"Active","ServiceName":"Bunny","stream":"rtsp://127.0.0.1:6554/0"}
```

## Config

- By default, the application uses /express-docker/config.json stored in the image as config. Users can pass their configuration by specifying a custom JSON file. By 
```
docker run --rm -it --network host --privileged -v <path of config.json>:/express-docker/config.json camera_route:latest
```
- service will use it's default config hardcode for any invalid config or config without services
- Json for config 

```javascript 
  {
    "host": "ip address export for rtsp client to connect",
    "port": 19612, // post for restful
    "rtspPort": 6554,  // rtsp server port for client to connecxt
    "rtpPortStart": 10000,
    "rtpPortCount": 10000,
    "services": 
        [ 
            {
                "name": "<Service name with ASCII>",
                "url": "rtsp://<user>:<password>@<rtsp server>/<video path>"
            },
        ]
    };
    //example:

    {
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
            },{
                "name": "Invalid",
                "url": "rtsp://rtspstre111am:bf8f0d443b174ac5576a3eaa456f38c6@zephyr.rtsp.stream/pattern"
            }
        ]
    }

```

## Getting Started

Linux 
1. Make sure you have [Docker](https://www.docker.com/) installed.
2. check out source code
3. Update config.json
4. Run `docker build -f Dockerfile.dev -t camera_route:latest .` to build container.
5. Run container `docker run --rm -it --network host --privileged camera_route:latest`


Mac and Windows
1. Make sure you have [Node JS and NPM](https://nodejs.org/en/download/) installed.
2. check out source code
3. Install ffmpeg [Mac](https://phoenixnap.com/kb/ffmpeg-mac) and [Win](https://phoenixnap.com/kb/ffmpeg-windows)
4. Update config.json
5. Run 'npm install' to install all require Package
6. Run 'node index.js' under source code folder.

## Health Check
Go to your browser and access http://127.0.0.1:19612 to confirm the server is running. Use http://127.0.0.1:19612/list to list all available services.

## To Do
1. Add API for Deactivating Service, Adding/Dropping service while running, and using custom paths.
2. Run without privileged mode.
3. Run with Docker network host driver.
4. Add test cases.
5. Add a page to test RESTful API and play video.
6. Port to work with https://github.com/bluenviron/mediamtx to support more codec without ffmpeg
7. Config target codec and bitrate per service. Transcode source video it that's different.

## Troubleshooting

- If you encounter any issues while running the containers, you can check the logs by running `docker logs [container-name]`.
- If you continue to have trouble, please open an issue on the project's Github page.

## Contribute

If you want to contribute to this project, you can create a fork and send a pull request.

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).


