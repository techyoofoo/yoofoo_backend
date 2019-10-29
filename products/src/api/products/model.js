import mongoose, { Schema } from "mongoose";

const productSchema = new Schema(
    {
        id: {
            type:  Schema.Types.ObjectId
        },
        name: {
            type: String
        },
        price: {
            type: Number
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

productSchema.methods = {
    view(full) {
        const view = {
            // simple view
            id: this.id,
            name: this.name,
            price: this.price,
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

const model = mongoose.model("Product", productSchema);

export const schema = model.schema;
export default model;

