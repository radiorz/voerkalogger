import { VoerkaLoggerLevel } from "./consts"
import type { BackendBase } from './BackendBase';
import type { BatchBackendBase } from './BatchBackendBase';
import "flex-tools/string"

// 日志配置
export interface VoerkaLoggerOptions{
    id?: string                                         // 当前应用ID
    enabled?:boolean                                    // 全局开关
    level?:VoerkaLoggerLevel                            // 全局日志级别
    debug?:boolean                                      // 是否在调试阶段，=true时所有日志均会输出
    output?: string[]                                   // 启用的输出后端
    context?:Record<string,any> | null                  // 全局上下文，可以用为输出时的插值变量
    injectGlobal?:boolean                               // 注入一个全局的logger变量名称
    catchGlobalErrors?: boolean                         // 是否捕获全局错误
    tags?:string[],                                     // 全局标签
    formats?:{
        datetime?:string | [string,number]              // 
        date?:string | [string,number]
        time?:string | [string,number]
    }
}
export interface VoerkaLoggerConfiguration extends VoerkaLoggerOptions{
    backends:Record<string,BackendConfiguration | BatchBackendConfiguration>         
}

export type LogMethodMessage =string | (()=> string)

// 日志记录
export interface VoerkaLoggerRecord{
    message: string                             // 日志信息
    level: VoerkaLoggerLevel                    // 日志级别
    timestamp?: number                          // 时间戳
    error?: string | Error                      // 错误信息
    tags?:string[]                              // 日志标签
    module?:string,                             // 应用模块名称或源文件
    [key: string]:any                           // 额外的信息
}

// 执行log方法时的参数类型
export type LogMethodOptions =Partial<Omit<VoerkaLoggerRecord,'message' & 'timestamp'>>
export type LogMethodVars = Record<string,any> | any[] | Error  | Function | any

// 对日志记录进行格式化以便输出到后端
export type VoerkaLoggerFormatter<Output=VoerkaLoggerRecord> = (record:VoerkaLoggerRecord,vars:LogMethodVars, backend?:BackendBase<any,any>)=>Output
export type VoerkaLoggerFormatters = Record<string,VoerkaLoggerFormatter>


export interface BackendBaseOptions<Output=string>{
    enabled?      : boolean                                             // 可以单独关闭指定的日志后端
    level?        : VoerkaLoggerLevel
    format?       : VoerkaLoggerFormatter<Output> | string | null
    // 缓冲区满或达到间隔时间时进行日志输出
    // 如果bufferSize=0则禁用输出，比如ConsoleBackend就禁用输出
    bufferSize?   : number                                              // 输出缓冲区大小
    flushInterval?: number                                              // 延迟输出时间间隔，当大于间隔时间j时进行输出
    // 

}


export type BackendConfiguration = BackendBaseOptions & {
    class?: typeof BackendBase
}

export interface BatchBackendBaseOptions<Output=VoerkaLoggerRecord> extends BackendBaseOptions<Output> {
    flushInterval?:number                   // 延迟输出时间间隔
    bufferSize?:number                      // 默认缓冲区大小，如果需要一条一条即刻输出可以指定为1
}

export type BatchBackendConfiguration = BackendConfiguration & {
    class?: typeof BatchBackendBase
}
