import Koa from 'koa';
import { KoaWebpackDevOptions } from './middlewares';
declare type ObjAndArray<T> = T | Array<T>;
interface KoaWebpackOption {
    hot?: boolean;
    open?: boolean;
    historyApiFallback?: boolean;
    port?: number;
    static?: ObjAndArray<{
        directory: string;
        publicPath?: string;
        serveIndex?: boolean;
    }>;
    proxy?: Record<string, {
        target: string;
        pathRewrite?: Record<string, string>;
        changeOrigin?: boolean;
        secure?: boolean;
    }>;
}
declare class KoaWebpackServer {
    private config;
    private compiler?;
    private historyApiFallbackWhiteList;
    app: Koa;
    private ignoreMiddlewares;
    constructor(config: Record<string, any>, app?: Koa);
    setConfig(config: Record<string, any>, mix?: boolean): this;
    setProxy(proxy: KoaWebpackOption['proxy'], mix?: boolean): this;
    setHistoryApiFallbackWhiteList(whiteList: Array<string>, mix?: boolean): void;
    private getLocalhostIp;
    setStaticServer(options: KoaWebpackOption['static'], mix?: boolean): this;
    /**
     * @description modules 模块或者模块名称
     */
    ignoreMiddleware(modules: Array<Function> | Array<string>): void;
    start(option?: KoaWebpackDevOptions | ((app: Koa) => void), fn?: (app: Koa) => void): void;
}
export default KoaWebpackServer;
