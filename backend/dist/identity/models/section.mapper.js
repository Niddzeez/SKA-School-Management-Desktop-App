"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapSection = void 0;
const mongoose_1 = require("mongoose");
const mapSection = (doc) => ({
    id: doc._id instanceof mongoose_1.Types.ObjectId ? doc._id.toString() : doc._id,
    classID: doc.classID,
    name: doc.name,
    classTeacherID: doc.classTeacherID,
});
exports.mapSection = mapSection;
//# sourceMappingURL=section.mapper.js.map