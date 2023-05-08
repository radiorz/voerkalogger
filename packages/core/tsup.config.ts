import { defineConfig } from 'tsup'

export default defineConfig([
    {
        entry: [
            'src/index.ts'
        ],
        format: ['esm','cjs','iife'],
        dts: true,
        splitting: true,
        sourcemap: true,
        clean: true,
        treeshake:true,  
        minify: true,
        banner: {
            js: `/**
    *        
    *   ---=== VoerkaLogger ===---
    *   https://zhangfisher.github.com/voerkalogger    * 
    *   轻量易用的日志输出库
    */`}
    }
]) 