/**
 * 
 * 默认的控制台输出
 * 不支持着色输出
 * 
 
 * 
 */
import { TransportBaseOptions,TransportBase, TransportOptions } from './transport';
import {  LogMethodVars,  VoerkaLoggerRecord } from "./types"
import { assignObject } from 'flex-tools/object/assignObject';
import {isNothing} from 'flex-tools/typecheck/isNothing'
import { DefaultFormatTemplate } from './consts';

const consoleMethods=[
    console.log,
	console.debug,
	console.info,
	console.warn,
	console.error,
    console.error
]

export interface ConsoleTransportOptions extends TransportBaseOptions<void>{
     
} 
export default class ConsoleTransport extends TransportBase<ConsoleTransportOptions>{     
    constructor(options?:TransportOptions<ConsoleTransportOptions>){
        super(assignObject({
            bufferSize:0,     
            format:DefaultFormatTemplate
        },options)) 
    }
    format(record: VoerkaLoggerRecord,interpVars:LogMethodVars):void{      
        const { format } = this.options
        try{         
            const template = typeof(format) == 'function'  ? format.call(this, record, interpVars) as unknown as string : format           
            record.message = record.message.params(interpVars)                   
            const vars:Record<string,any> = {
                ...this.getInterpVars(record),
                ...record,
            }       

            let output = template!.params(vars,{
                $forEach:(name:string,value:string,prefix:string,suffix:string)=>{
                    if(name.includes("/")){
                        const varnames = name.split("/")
                        // 如果所有的变量都是空的，则返回
                        const isEmpty = varnames.every((name:string)=>isNothing(name in vars ? vars[name] : null))
                        if(isEmpty){
                            return null
                        }else{
                            value = varnames.map((name:string)=>{
                               return vars[name] = vars[name] || ""
                            }).filter(v=>String(v).length>0).join("/")
                            return [prefix,value,suffix]
                        }
                    }
                }
            })    
            const level = record.level 
            const logMethod =record.level < 0 && record.level > consoleMethods.length ?  consoleMethods[record.level]  : consoleMethods[record.level] 
            logMethod(output.params(vars))              
        }catch(e:any){   
            console.error(e.stack)
        }        
    }    
    /**
     * 清除所有存储的日志
     */
    async clear(){
        console.clear()
    }  
}