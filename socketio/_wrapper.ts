import { Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

export const SocketWrapper = {
    wrapListener(listener: (socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) => void){
        return (socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>)=>{
            listener(socket);
        }
    }
}