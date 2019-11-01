import mongoose, { Schema } from "mongoose";

const roleSchema = new Schema(
    {
        id: {
            type: String
        },
        name: {
            type: String
        },
        description: {
            type: String
        },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
            required: true
        },
        timestamps: {
            type: Date,
            default: Date.now,
            required: true
        }
    }
);

roleSchema.methods = {
    view(full) {
        const view = {
            // simple view
            id: this.id,
            name: this.name,
            permission: this.permission,
            status: this.status,
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

const model = mongoose.model("role", roleSchema);

export const schema = model.schema;
export default model;

