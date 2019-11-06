import mongoose, { Schema } from "mongoose";

const menuSchema = new Schema(
    {
        name: {
            type: String
        },
        type: {
            type: String,
            enum: ["menu", "submenu"],
        },
        state: {
            type: String,
            enum: ["enable", "disable"],
            default: "enable"
        },
        parentid: {
            type: String
        },
        timestamps: {
            type: Date,
            default: Date.now,
            required: true
        }
    }
);

menuSchema.methods = {
    view(full) {
        const view = {
            // simple view
            name: this.name,
            type: this.type,
            state: this.state,
            parentid: this.parentid,
            timestamps: this.timestamps
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

