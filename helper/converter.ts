export default class Converter{
    stringToDate(str?: string){
        if(!str){
            return null;
        }
        
        return new Date(str);
    }
}