import * as uuid from "uuid";
export default class UUID_Helper {
    createToken(): number[]{
        const bytes = uuid.parse(uuid.v1());
        return Array.prototype.slice.call(bytes);
    }
}