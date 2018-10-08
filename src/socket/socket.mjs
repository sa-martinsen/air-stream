import {stream} from "../index.mjs"

export default ( { url, format = "PING/PONG",  pingtms = 0, reconnecttms = 0 } ) =>

    stream((emt, { over }) => {

        const [ pingmsg, pongmsg ] = format.split("/");

        let pingpong = 0;
        let reconnecttimeout = null;
        let pinginterval = null;
        let socket = null;

        function unsubscribe() {

            if(reconnecttimeout) {
                clearTimeout(reconnecttimeout);
                reconnecttimeout = null;
            }

            if(socket) {
                socket.removeEventListener("open", connection);
                socket.removeEventListener("message", connection);
                socket.removeEventListener("close", connection);
                socket.close();
                socket = null;
            }

            if(pinginterval) {
                clearInterval(pinginterval);
                pinginterval = null;
            }

        }

        function reconnect() {

            unsubscribe();

            if(reconnecttms) {
                reconnecttimeout = setTimeout(reconnect, reconnecttms);
            }

            socket = new WebSocket( url );
            socket.addEventListener("open", connection);
            socket.addEventListener("message", connection);
            socket.addEventListener("close", connection);

        }

        const connection = {

            handleEvent(event) {

                if (event.type === "open") {
                    emt.kf();
                    if(reconnecttimeout) {
                        clearTimeout(reconnecttimeout);
                        reconnecttimeout = null;
                    }
                    if(pingtms) {
                        pingpong = 0;
                        pinginterval = setInterval(() => {
                            pingpong++;
                            if (pingpong > 1) {
                                reconnect();
                            }
                            else {
                                socket.readyState === 1 && socket.send(pingmsg);
                            }
                        }, pingtms);
                    }
                }

                else if (event.type === "close") {
                    console.warn(event);
                }

                else if (event.type === "message") {
                    if (event.data === pongmsg) {
                        pingpong--;
                    }
                    else {
                        emt(event.data);
                    }
                }

            }

        };

        over.add( (dissolve, data) => {
            if(!dissolve && socket.readyState === 1) {
                socket.send(data);
            }
        } );
        reconnect();

        return unsubscribe;

    })