import mongoose, { Schema } from "mongoose";

const rolePermission = new Schema(
    {
        roleid: {
            type: String
        },
        permission: [{
            type: String
        }]
    
    }
);

rolePermission.methods = {
    view(full) {
        const view = {
            // simple view
            id: this.id,
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

const model = mongoose.model("role-permission", rolePermission);

export const schema = model.schema;
export default model;

