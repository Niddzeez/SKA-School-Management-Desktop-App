"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapStudent = void 0;
const mongoose_1 = require("mongoose");
const mapStudent = (doc) => {
    return {
        id: doc._id instanceof mongoose_1.Types.ObjectId ? doc._id.toString() : doc._id,
        ...doc,
        _id: undefined,
        __v: undefined,
    };
};
exports.mapStudent = mapStudent;
//# sourceMappingURL=student.mapper.js.map