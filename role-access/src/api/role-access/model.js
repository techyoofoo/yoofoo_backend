import mongoose, { Schema } from "mongoose";

const roleAccessSchema = new Schema(
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
        roleid: [
            { type: Schema.Types.ObjectId, ref: 'role' }
        ],
        menus: [
            {
                menu: {
                    type: String, ref: 'menu'
                },
                permission: {
                    type: Array,
                    default: ['read']
                }
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

