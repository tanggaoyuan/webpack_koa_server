"use strict";
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
/* eslint-disable prefer-rest-params */
const webpack_hot_middleware_1 = __importDefault(require("webpack-hot-middleware"));
const PassThrough = require('stream').PassThrough;
const HotMiddleware = (compiler, opts) => {
    const middleware = (0, webpack_hot_middleware_1.default)(compiler, opts);
    return (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
        if (ctx.originalUrl === '/koa_hot') {
            const stream = new PassThrough();
            ctx.body = stream;
            yield middleware(ctx.req, Object.assign(Object.assign({}, ctx.res), { end(content) {
                    ctx.body = content;
                }, write: stream.write.bind(stream), writeHead: (status, headers) => {
                    ctx.status = status;
                    ctx.set(headers);
                } }), next);
        }
        else {
            yield next();
        }
    });
};
exports.default = HotMiddleware;
