import mongoose, { Schema } from "mongoose";

const menuSchema = new Schema(
    {
        id: {
            type: String
        },
        clientid: {
            type: String
        },
        name: {
            type: String
        },
        type:{
            type: String,
            enum: ["menu", "submenu"],
        },
        state: {
            type: String,
            enum: ["enable", "disable"],
            default: "enable"
        },
        path: {
            type: String
        },
        parentid: {
            type: String
        }
    }
);

menuSchema.methods = {
    view(full) {
        const view = {
            // simple view
            id: this.id,
            clientid: this.clientid,
            name: this.name,
            state: this.state,
            path: this.path,
            parentid: this.parentid
        };

        return full
            ? {
                ...view
                // add properties for a full view
            }
            : view;
    }
};

const model = mongoose.model("menu", menuSchema);

export const schema = model.schema;
export default model;

