/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-spread */
/* eslint-disable prefer-rest-params */
// https://www.npmjs.com/package/koa-webpack-dev-middleware
'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const webpack_dev_middleware_1 = __importDefault(require("webpack-dev-middleware"));
function middleware(doIt, req, res) {
    const { end: originalEnd } = res;
    return new Promise((resolve) => {
        res.end = function end() {
            originalEnd.apply(this, arguments);
            resolve(0);
        };
        doIt(req, res, () => {
            resolve(1);
        });
    });
}
function KoaWebpackDev(compiler, options) {
    const doIt = (0, webpack_dev_middleware_1.default)(compiler, options);
    function koaMiddleware(ctx, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { req, res } = ctx;
            const locals = ctx.locals || ctx.state;
            ctx.webpack = doIt;
            const runNext = yield middleware(doIt, req, Object.assign(Object.assign({}, res), { end(content) {
                    ctx.body = content;
                },
                locals,
                setHeader() {
                    ctx.set.apply(ctx, arguments);
                }, getHeader: (name) => {
                    return res.getHeader(name);
                } }));
            if (runNext) {
                yield next();
            }
        });
    }
    Object.keys(doIt).forEach(p => {
        koaMiddleware[p] = doIt[p];
    });
    return koaMiddleware;
}
exports.default = KoaWebpackDev;
