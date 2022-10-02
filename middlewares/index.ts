import KoaConnenctHistoryApiFallBack from './koa-connect-history-api-fallback';
import KoaWebpackDev, { KoaWebpackDevOptions } from './koa-webpack-dev';
import KoaWebpackHot from './koa-webpack-hot';
import { Options } from 'http-proxy-middleware';

export {
  KoaWebpackDev,
  KoaConnenctHistoryApiFallBack,
  KoaWebpackHot
}; 

export type { Options as ProxyOptions, KoaWebpackDevOptions };

