import WebpackHotMiddleware from 'webpack-hot-middleware';
import webpack from 'webpack';
declare const HotMiddleware: (compiler: webpack.Compiler, opts?: WebpackHotMiddleware.MiddlewareOptions) => (ctx: any, next: any) => Promise<void>;
export default HotMiddleware;
