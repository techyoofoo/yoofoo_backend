import mongoose, { Schema } from "mongoose";

const roleAccessSchema = new Schema(
    {
        name: {
            type: String
        },
        roleid: {
            type: String
        },
        menus: [
            {
                _id: {
                    type: Schema.Types.ObjectId
                },
                parentid: {
                    type: String
                },
                type: {
                    type: String
                },
                permission: [{
                    _id: {
                        type: Schema.Types.ObjectId,
                    },
                    value: {
                        type: Boolean
                    }
                }]
            }
        ]
    }
);

roleAccessSchema.methods = {
    view(full) {
        const view = {
            // simple view
            id: this.id,
            name: this.name,
            description: this.description,
            roleid: this.roleid,
            menu: this.menu
        };

        return full
            ? {
                ...view
                // add properties for a full view
            }
            : view;
    }
};

const model = mongoose.model("role-access", roleAccessSchema);

export const schema = model.schema;
export default model;

