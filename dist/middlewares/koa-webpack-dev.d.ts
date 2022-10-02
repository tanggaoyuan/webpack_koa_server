import expressMiddleware, { IncomingMessage } from 'webpack-dev-middleware';
import webpack from 'webpack';
export declare type KoaWebpackDevOptions = expressMiddleware.Options<IncomingMessage, expressMiddleware.ServerResponse>;
export default function KoaWebpackDev(compiler: webpack.Compiler, options?: KoaWebpackDevOptions): (ctx: any, next: any) => Promise<void>;
