/**
 * 
 *  将日志打印到本地文件 
 *   
 */
import "flex-tools/string"
import { TransportBase, TransportBaseOptions, TransportOptions } from "@voerkalogger/core"
import { assignObject } from "flex-tools/object/assignObject"
import type { FileSize } from "flex-tools/types"
import { parseFileSize } from "flex-tools/misc"
import path from "path"
import fs  from "fs-extra" 
import { zip } from "./zip"


export type FileTransportOptions<Output> =  TransportBaseOptions<Output> & { 
    location?: string                               // 保存日志文件的位置
    compress?: boolean                              // 是否进行压缩
    maxSize?: FileSize                              // 单个日志文件最大尺寸,如`5MB`    
    maxFileCount?: number                           // 日志文件数量限制   
}

export default class FileTransport<Output = string> extends TransportBase<FileTransportOptions<Output>> {
    #outputPath:string = ""                                     // 日志完整输出路径
    #logFileSize:number = 0                                     // 当前输出日志文件的大小
    #logFilename?:string                                        // 当前输出文件名称
    #maxSize:number = 0                                         // 单个文件的最大尺寸限制
    constructor(options?:TransportOptions<FileTransportOptions<Output>>) {
        super(
            assignObject({
                location: "./logs",                             // 保存日志文件的位置         
                compress: false,                                // 是否进行压缩
                encoding: "utf8",                               // 编码，默认为utf8
                maxSize:'50MB',                                 // 单个日志文件最大尺寸,如`5MB`
                maxFileCount: 10                                // 日志文件数量限制                         
            }, options ) 
        );         
        this.#outputPath = path.isAbsolute(this.options.location) ? this.options.location : path.join( process.cwd(),this.options.location)
        this.#maxSize = parseFileSize(this.options.maxSize)
    }   
    async output(result: Output[]) {        
        // 1. 取得当前文件
        if(!this.#logFilename){
            this.#logFilename = await this.getLogFilename()  
        }          
        const logBuffer = Buffer.from(result.join("\n") + "\n")
        // 超出文件尺寸时，需要重新生成一个文件名称
        if(this.#logFileSize+logBuffer.length>this.#maxSize){
            this.#logFilename = await this.getLogFilename()  
        }
        await fs.appendFile(this.#logFilename, logBuffer,{encoding:"utf8"})
        this.#logFileSize = this.#logFileSize + logBuffer.length          
    }

     /**
     *  文件名从新至旧为 1.log,2.log,...n.log，
     *  当超过备份文件数时，将删除最旧的文件，
     *  1.log总是最新日志数据
     * @returns 
     */
    private async getLogFilename() {        
        let curFilename =  path.join(this.#outputPath,"1.log")        
        const backupFileCount = this.options.maxFileCount - 1    // 备份数量
        const logPath = path.dirname(curFilename)                // 输出文件夹
        await fs.mkdirp(logPath)
        try{
        // 判定文件是否超出大小
        if (await fs.exists(curFilename)) {
            let stat = await fs.stat(curFilename)
            if(stat.size > this.#maxSize){                
                // 已经达到最大的文件数量时，需要删除最旧的文件，并且将旧日记文件依次更名
                for(let i=backupFileCount;i>0;i--){
                    let logFile = path.join(logPath,`${i}.log`)
                    if(await fs.exists(logFile)){
                        const newFile = path.join(logPath,`${i+1}.log`)
                        await fs.rename(logFile,newFile)
                        if(this.options.compress){
                            try{
                                await this.compressLogFile(newFile)
                                await fs.rm(newFile)
                            }catch{ }                            
                        }
                    }else if(await fs.exists(`${logFile}.zip`)){                        
                        await fs.rename(`${logFile}.zip`,path.join(logPath,`${i+1}.log.zip`))
                    }
                }
                this.#logFileSize = 0
            }else{
                this.#logFileSize = stat.size
            }
        }else{
            this.#logFileSize = 0
        }

        }catch(e){
            console.log(e)
        }

        return curFilename
    }
    private async compressLogFile(logFile:string){
        zip(logFile,`${logFile}.zip`)
    }
    /**
     * 清空日志 
     */
    async clear(){
        const counts = Array.from({ length: this.options.maxFileCount }).fill(0)
        const logs = counts.map((v,i) =>{
            return path.join(this.#outputPath,`${i+1}.log`)
        })
        logs.push(...counts.map((v,i) =>{
            return path.join(this.#outputPath,`${i+1}.log.zip`)
        }))
        await Promise.all(logs.map(async file=>{
            try{
                await fs.rm(file)
            }catch{}
        }))
    } 
    /**
     * 将所有缓冲区的日志输出到文件
     * 
     * 一般情况下，当程序退出时，会调用此方法,将缓冲区的日志输出到文件
     * 
     */
    destroy(): void {
        if(this.buffer.length>0 && this.#logFilename){
            fs.appendFileSync(this.#logFilename, this.buffer.join("\n") + "\n",{encoding:"utf8"})
        }
    }
}
 


