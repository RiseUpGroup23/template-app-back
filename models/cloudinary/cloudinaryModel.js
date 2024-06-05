const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { defaultStringValue } = require("../../config");

const CloudinarySchema = new Schema({
    cloud: {
        type: String,
        default: defaultStringValue
    },
    appKey: {
        type: String,
        default: defaultStringValue
    },
    appToken: {
        type: String,
        default: defaultStringValue
    }
});

const CloudinaryModel = mongoose.model("CloudinarySchema", CloudinarySchema);

module.exports = { CloudinaryModel };
