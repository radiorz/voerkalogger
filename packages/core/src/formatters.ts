import type { Logger } from "./Logger"
import { LogFormatters, LogRecord } from "./types"
import { getInterpolatedVars } from "./utils"
  
// 默认的格式化器
function defaultFormatter<R=LogRecord>(this:Logger,record:LogRecord):R{     
    const logger = this
    let extra = []
    if(Array.isArray(record.tags) && record.tags.length>0){
        extra.push(`tags=${record.tags.join(',')}`)
    }
    if(record.module){
        extra.push(`module=${record.module}` )
    }     
    return `[{level}] - {datetime} : {message}${extra.length>0 ? '('+extra.join(",")+')' : ''}`.params(getInterpolatedVars.call(this,record) ) as R
} 

function jsonFormatter(record:LogRecord){ 
    return JSON.stringify(record)
}

 export default {
     default: defaultFormatter,
     json   : jsonFormatter,
 } as LogFormatters
