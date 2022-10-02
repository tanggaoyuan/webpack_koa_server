/**
 * @description 来源
 * https://www.npmjs.com/package/koa2-connect-history-api-fallback
 */
import { Middleware } from 'koa';
interface IRewrites {
    from: string;
    to: string;
}
interface IOptions {
    logger?: object;
    index?: string | '/default.html';
    whiteList?: string[];
    rewrites?: IRewrites[];
    verbose?: boolean;
    htmlAcceptHeaders?: string[];
    disableDotRule?: boolean;
}
declare function historyApiFallback(options?: IOptions): Middleware;
export default historyApiFallback;
export { historyApiFallback };
