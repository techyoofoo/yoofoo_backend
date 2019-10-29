import mongoose, { Schema } from "mongoose";

const companiesSchema = new Schema(
    {
        id: {
            type: Schema.Types.ObjectId
        },
        name: {
            type: String
        },
        noofusers: {
            type: Number
        },
        taxid: {
            type: String
        },
        description: {
            type: String
        },
        status: {
            type: String,
            enum: ["active", "in-active"],
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

companiesSchema.methods = {
    view(full) {
        const view = {
            // simple view
            id: this.id,
            name: this.name,
            noofusers: this.noofusers,
            taxid: this.taxid,
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

const model = mongoose.model("company", companiesSchema);

export const schema = model.schema;
export default model;
