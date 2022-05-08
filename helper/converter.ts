export default class Converter{
    stringToDate(str?: string){
        if(!str){
            return null;
        }
        
        return new Date(str);
    }
    parseInt(value: any){
        if(value && !isNaN(value)){
            try{
                return parseInt(value);
            }
            catch(ex: any){
            }
        }
        //helper.logger.traceWithTag(tag, "Cannot parse value(" + value + ") to number");
    }
}