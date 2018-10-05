import {stream} from "../index.mjs"

export default ( { url } ) =>

    stream((emt, { hook }) => {

        let pingpong = 0;
        let pingintervalid;

        hook.add( ({ request }) => {
            socket.readyState === 1 && socket.send( request );
        } );

        const connection = {

            handleEvent(event) {

                if (event.type === "open") {
                    emt.kf();
                    pingpong = 0;
                    pingintervalid = setInterval(() => {
                        pingpong ++ ;
                        if(pingpong > 1) {
                            unsubscribe(socket, pingintervalid);
                            socket = subscribe(url, connection);
                        }
                        else {
                            socket.readyState === 1 && socket.send( "PING" );
                        }
                    }, 5000);
                }

                else if (event.type === "close") {
                    console.warn(event);
                }

                else if (event.type === "message") {
                    if(event.data === "PONG") {
                        pingpong -- ;
                    }
                    else {
                        emt( event.data );
                    }
                }

            }

        };

        let socket = subscribe(url, connection);

        return () => unsubscribe(socket, pingintervalid);

    })

function unsubscribe(socket, pingintervalid) {
    clearInterval(pingintervalid);
    socket.removeEventListener("open", connection);
    socket.removeEventListener("message", connection);
    socket.removeEventListener("close", connection);
    socket.close();
}

function subscribe(url, connection) {
    let socket = new WebSocket(url);
    socket.addEventListener("open", connection);
    socket.addEventListener("message", connection);
    socket.addEventListener("close", connection);
    return socket;
}