import { VoerkaLogger } from '../../../core/src/Logger';
/**
 * 
 * 支持控制台着色输出的日志传输器
 * 
 */

/**
 * this指向实现Logger实例
 
 * 
 */
import { TransportBaseOptions,TransportBase, TransportOptions } from '@VoerkaLogger/core';
import {  LogMethodVars,  VoerkaLoggerRecord } from "@VoerkaLogger/core"
import logsets from "logsets" 
import { assignObject } from 'flex-tools';

const logLevelColors = [
    "darkGray",                             // NOSET
    "darkGray",                             // DEBUG
    "lightGray",                            // INFO
    "yellow",                               // WARN
    "red",                                  // ERROR
    "red,bright"                            // FATAL
]

 
const consoleMethods=[
    logsets.log,
	logsets.debug,
	logsets.info,
	logsets.warn,
	logsets.error,
    logsets.error
]

export interface ConsoleTransportOptions extends TransportBaseOptions<void>{
    colorize?: boolean                  // 是否着色输出
}


export default class ConsoleTransport extends TransportBase<ConsoleTransportOptions>{     
    constructor(options?:TransportOptions<ConsoleTransportOptions>){
        super(assignObject({
            // 关闭缓冲区，控制台输出不需要启用异步输出
            bufferSize:0,     
            colorize:true,          
            format:"[{levelName}] - {datetime} : {message}{<,module=>module}{<,tags=>tags}"    
        },options))
        logsets.config({
            String:"lightGreen"
        })
    }
    format(record: VoerkaLoggerRecord,interpVars:LogMethodVars):void{      
        const { colorize,format } = this.options
        try{         
            const template = typeof(format) == 'function'  ? format.call(this, record, interpVars) as unknown as string : format
           
            if(colorize){
                record.message = logsets.getColorizedTemplate(record.message,interpVars)
            }else{
                record.message = record.message.params(interpVars)
            }
            const vars ={
                ...this.getInterpVars(record),
                ...record,
            }
            const output = template!.params(vars)
            if(colorize){
                const levelColorizer = logsets.getColorizer(logLevelColors[record.level])
                console.log(levelColorizer(logsets.getColorizedTemplate(output,vars)))
            }else{
                console.log(output.params(vars))
            }            
        }catch(e:any){   
            console.log(e.stack)
        }        
    }    
    /**
     * 清除所有存储的日志
     */
    async clear(){
        console.clear()
    }  
}