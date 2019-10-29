import mongoose, { Schema } from "mongoose";

const userRegistrationSchema = new Schema(
    {
        id: {
            type: Schema.Types.ObjectId
        },
        firstname: {
            type: String
        },
        lastname: {
            type: String
        },
        email: {
            type: String
        },
        age: {
            type: Number
        },
        gender: {
            type: String
        },
        password: {
            type: String
        },
        username: {
            type: String
        },
        mobileno: {
            type: Number
        },
        usertype: {
            type: String,
            enum: ["ANONYMOUS", "CUSTOMER"],
            default: "CUSTOMER"
        },
        groupid: {
            type: Schema.Types.ObjectId, ref: "usergroup"
        },
        companyname: {
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

userRegistrationSchema.methods = {
    view(full) {
        const view = {
            // simple view
            id: this.id,
            firstname: this.firstname,
            lastname: this.lastname,
            email: this.email,
            age: this.age,
            gender: this.gender,
            password: this.password,
            userName: this.userName,
            mobileno: this.mobileno,
            status: this.status,
            usertype: this.usertype,
            groupid: this.groupid,
            companyname: this.companyname,
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

const model = mongoose.model("user", userRegistrationSchema);
export const schema = model.schema;
export default model;

