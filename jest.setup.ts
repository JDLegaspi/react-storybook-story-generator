import "openai/shims/node";
import { Headers, Request, Response } from "node-fetch";

global.Headers = Headers;
global.Request = Request;
global.Response = Response;
