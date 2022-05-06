import { Request, Response, NextFunction } from "express";
import { wrap } from "module";
import multer from "multer";
import helper from "../../helper";
import { buildResponseError, buildResponseSuccess } from "./utilities";

export enum InputSource {
    body, query, locals
}

function getInput(req: Request, res: Response, source: InputSource) {
    if (source === InputSource.body) {
        return req.body;
    }
    if (source === InputSource.query) {
        return req.query;
    }
    if (source === InputSource.locals) {
        return res.locals.input;
    }
}

export const RouteHandleWrapper = {
    getInput,
    wrapMiddleware(handle: (req: Request, res: Response) => any, tag = "Default Tag", skipIfError = true) {
        return async (req: Request, res: Response, next: NextFunction) => {
            if (skipIfError && res.locals.error) {
                next();
                return;
            }

            try {
                await handle(req, res);
            }
            catch (ex: any) {
                console.log(ex);
                helper.logger.errorWithTag(tag, ex);

                const { errorCode = 2, errorMessage = "Unexpected error on server" } = ex;
                res.locals.error = buildResponseError(errorCode, errorMessage);
            }
            next();
        };
    },
    /**
     * 
     * @param parseFunction 
     * @param tag 
     * @param inputSource Default is InputSource.body
     * @returns 
     */
    wrapCheckInput(parseFunction: (input: any) => any, tag: string, inputSource: InputSource = InputSource.body, onFailed?: () => any) {
        return this.wrapMiddleware(async (req, res) => {
            const input = getInput(req, res, inputSource);
            const inputParsed = await parseFunction(input);

            try {
                // Check input
                if (!inputParsed) {
                    throw buildResponseError(1, "Invalid input");
                }

                // Pass input to locals
                res.locals.input = inputParsed;
            }
            catch (ex: any) {
                helper.logger.errorWithTag(tag, ex);

                const { errorCode = 2, errorMessage = "Unexpected error on server" } = ex;
                res.locals.error = buildResponseError(errorCode, errorMessage);
            }
        }, tag, true);
    },

    /**
     * Wrap a handle function to a middleware with input from inputsource
     * @param handle 
     * @param tag 
     * @param inputSource Default is InputSource.locals
     * @returns 
     */
    wrapHandleInput(handle: (input: any) => Promise<any>, tag: string, inputSource: InputSource = InputSource.locals, onError?: WrapperErrorCallback) {
        return this.wrapMiddleware(async (req, res) => {
            const input = getInput(req, res, inputSource);
            try {
                const result = await handle(input);
                //helper.logger.trace("Result is " + JSON.stringify(result, null, 2));
                res.locals.responseData = buildResponseSuccess(result);
                //helper.logger.trace("Locals is " + JSON.stringify(res.locals, null, 2));
            }
            catch (ex: any) {
                console.log(ex);
                helper.logger.errorWithTag(tag, ex);

                const { errorCode = 2, errorMessage = "Unexpected error on server" } = ex;
                res.locals.error = buildResponseError(errorCode, errorMessage);
            }
        }, tag, true);
    },
    wrapHandleError(handle: (error: any) => any, tag: string) {
        return async (req: Request, res: Response, next: NextFunction) => {
            if (res.locals.error) {
                try {
                    await handle(res.locals.error);
                }
                catch (ex: any) {
                    console.log(ex);
                    helper.logger.errorWithTag(tag, ex);

                    const { errorCode = 2, errorMessage = "Unexpected error on server" } = ex;
                    res.locals.error = buildResponseError(errorCode, errorMessage);
                }
            }
            next();
        };
    },
    wrapMulterUpload(upload: any) {
        return (req: any, res: Response, next: NextFunction) => {
            upload(req, res, function (err: any) {
                if (err instanceof multer.MulterError) {
                    helper.logger.trace(JSON.stringify(err, null, 2));
                    res.locals.error = buildResponseError(5, "Upload file failed");
                }
                next();
            });
        }
    },
}

export type WrapperErrorCallback = (context: any, err: any) => any;