export default class AppLogger{
    trace(msg :string) {
        console.log(msg);    
    }

    traceWithTag(tag:string, msg :string) {
        console.log(`[${tag}] : ${msg}`);    
    }

    error(msg : string){
        console.error(msg);
    }

    errorWithTag(tag:string, ex :any) {
        console.log("Has error with tag: " + tag);
        console.log(JSON.stringify(ex, null, 2));
    }
}
export const MyLogger = new AppLogger();