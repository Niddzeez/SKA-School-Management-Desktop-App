"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapClass = void 0;
const mongoose_1 = require("mongoose");
const mapClass = (doc) => ({
    id: doc._id instanceof mongoose_1.Types.ObjectId ? doc._id.toString() : doc._id,
    ClassName: doc.ClassName,
});
exports.mapClass = mapClass;
//# sourceMappingURL=class.mapper.js.map