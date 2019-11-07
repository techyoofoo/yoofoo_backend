import mongoose, { Schema } from "mongoose";

const permission = new Schema(
    {
        _id: {
            type: String
        },
        name: {
            type: String
        },
        state: {
            type: String,
            enum: ['enable', 'disable'],
            default: 'enable'
        }
    }
);

permission.methods = {
    view(full) {
        const view = {
            // simple view
            _id: this._id,
            name: this.name,
            state: this.state
        };

        return full
            ? {
                ...view
                // add properties for a full view
            }
            : view;
    }
};

const model = mongoose.model("permission", permission);

export const schema = model.schema;
export default model;

