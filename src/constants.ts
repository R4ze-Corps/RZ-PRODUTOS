import constantsJson from "../constants.json" with { type: "json" };

declare global {
    var constants: typeof constantsJson;
}

Object.assign(globalThis, Object.freeze({
    constants: constantsJson
}));
