import UserSchema from "./model";


export const create = function (request, reply) {
    const user = new UserSchema(request.payload)
    return new Promise(async (resolve, reject) => {
        try {
            user
                .save()
                .then(data => {
                    return resolve(reply.response({ Message: "User registered successfully" }).code(200));
                })
                .catch(err => {
                    return resolve(reply.response({
                        message: err.message || "error occurred while creating user."
                    }));
                });
        }
        catch (err) {
            return resolve(reply.response(err));
        }
    });
}

export const getAll = function (request, reply) {
    return new Promise(async (resolve, reject) => {
        try {
            UserSchema.find({}).then(result => {
                return resolve(reply.response(result).code(200));
            }).catch(err => {
                return resolve(reply.response({
                    message: err.message || "error occurred while retrieve users."
                }));
            })
        }
        catch (err) {
            return resolve(reply.response(err));
        }
    });
}

export const updateUserById = function (request, reply) {
    return new Promise(async (resolve, reject) => {
        try {
            await UserSchema.findOneAndUpdate({ _id: request.params.id }, request.payload, { new: false })
                .then(UserInfo => {
                    return resolve(reply.response({ Message: `${UserInfo.firstname} Updated Successfully` }).code(200));
                })
                .catch(err => {
                    return resolve(reply.response({
                        message: err.message || "error occurred while updating user."
                    }));
                });
        }
        catch (err) {
            return resolve(reply.response(err));
        }
    });
}


export const deleteUserById = function (request, reply) {
    return new Promise(async (resolve, reject) => {
        try {
            await UserSchema.deleteOne({ _id: request.params.id })
                .then(UserInfo => {
                    if (UserInfo.deletedCount > 0)
                        return resolve(reply.response({ Message: `${request.params.id} Deleted Successfully` }).code(200));
                    else
                        return resolve(reply.response({ Message: "No records found" }).code(200));
                })
                .catch(err => {
                    return resolve(reply.response({
                        message: err.message || "error occurred while deleting user."
                    }));
                });
        }
        catch (err) {
            return resolve(reply.response(err));
        }
    });
}




export const findUserById = function (request, reply) {
    return new Promise(async (resolve, reject) => {
        try {
            await UserSchema.findById({ _id: request.params.id })
                .then(UserInfo => {
                    return resolve(reply.response(UserInfo).code(200));
                })
                .catch(err => {
                    return resolve(reply.response({
                        message: err.message
                    }));
                });
        }
        catch (err) {
            return resolve(reply.response(err));
        }
    });
}











