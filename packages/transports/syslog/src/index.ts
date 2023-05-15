import { TransportBase, TransportBaseOptions } from "@voerkalogger/core"

export interface SysLogTransportOptions<Output>  extends TransportBaseOptions<Output> {

}

export default class SysLogTransport<Output = string> extends TransportBase<SysLogTransportOptions<Output>>{

} 