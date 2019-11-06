import mongoose, { Schema } from "mongoose";

const roleSchema = new Schema(
    {
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
            name: this.name,
            description: this.description,
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

