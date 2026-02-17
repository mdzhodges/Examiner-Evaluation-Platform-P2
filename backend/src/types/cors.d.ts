declare module "cors" {
    import type { RequestHandler } from "express";

    type StaticOrigin = boolean | string | RegExp | (string | RegExp)[];

    type CustomOriginCallback = (err: Error | null, allow?: boolean) => void;
    type CustomOrigin = (origin: string | undefined, callback: CustomOriginCallback) => void;

    export type CorsOptions = {
        origin?: StaticOrigin | CustomOrigin;
        methods?: string | string[];
        credentials?: boolean;
        allowedHeaders?: string | string[];
        exposedHeaders?: string | string[];
        maxAge?: number;
        preflightContinue?: boolean;
        optionsSuccessStatus?: number;
    };

    export default function cors(options?: CorsOptions): RequestHandler;
}

