import { startExpress } from "./api";
import { startSocketIO } from "./socketio";

const app = startExpress();
const io = startSocketIO();