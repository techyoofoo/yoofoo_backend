import mongoose, { Schema } from "mongoose";

const groupSchema = new Schema(
    {
        clientid: {
            type: String
        },
        name: {
            type: String
        },
        description: {
            type: String
        },
        roleid: [{
            type: Schema.Types.ObjectId, ref: "role"
        }]
    }
);

groupSchema.methods = {
    view(full) {
        const view = {
            // simple view
            id: this.id,
            clientid: this.clientid,
            name: this.name,
            description: this.description,
            roleid: this.roleid
        };

        return full
            ? {
                ...view
                // add properties for a full view
            }
            : view;
    }
};

const model = mongoose.model("usergroup", groupSchema);

export const schema = model.schema;
export default model;

