import { VoerkaLoggerLevel } from "./consts"
import type { BackendBase } from './BackendBase';

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
}

export interface VoerkaLoggerConfiguration extends VoerkaLoggerOptions{
     
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

 
