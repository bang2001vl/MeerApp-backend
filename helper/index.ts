import Converter from "./converter";
import AppLogger from "./log_helper";
import TimeHelper from "./time";
import UUID_Helper from "./uuid";

const helper = {
    converter : new Converter(),
    logger: new AppLogger(),
    uuid: new UUID_Helper(),
    time: new TimeHelper(),
}

export default helper;