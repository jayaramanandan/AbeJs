"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsdom_1 = require("jsdom");
class Utils {
    constructor() {
        throw new Error();
    }
    static initialiseDom(htmlString) {
        return new jsdom_1.JSDOM(htmlString).window.document;
    }
}
exports.default = Utils;
