import dayjs from "dayjs";

const dateTimeFormat = "YYYY-MM-DDTHH:mm:ssZ";

export default class TimeHelper {
    currentTimeUTC(){
        return new Date().toISOString();
    }
    convertToString(d: string | number | Date | dayjs.Dayjs | null | undefined){
        return dayjs(d).format(dateTimeFormat);
    }
    currentTimeString(){
        return dayjs().format(dateTimeFormat);
    }
    isInFuture(dateTime: string){
        return dayjs().isBefore(dateTime);
    }
    compare(a: string | number | Date | dayjs.Dayjs, b: string | number | Date | dayjs.Dayjs){
        const dt1 = dayjs(a);
        const dt2 = dayjs(b);
        if(dt1.isAfter(dt2)){
            return 1;
        }
        else if(dt1.isBefore(dt2)){
            return -1;
        }
        else{
            // Equal
            return 0;
        }
    }
    getDayRange(date: string){
        let target = dayjs(date);
        
        target = target.hour(0);
        target = target.minute(0);
        target = target.second(0);
        const start = target.format(dateTimeFormat);

        target = target.hour(23);
        target = target.minute(59);
        target = target.second(59);
        const end = target.format(dateTimeFormat);

        return {
            start,
            end,
        }
    }
}