import UserSchema from "./model";


export const create = function (request, reply) {
    return new Promise(async (resolve, reject) => {
        try {
            UserSchema.find({ email: request.payload.email }).then(result => {
                if (result.length !== 0) {
                    return resolve(reply.response({ Message: "User already exist" }).code(200));
                }
                else {
                    UserSchema.find({}).then(data => {
                        request.payload.id = data.length + 1
                        request.payload.roleid = !request.payload.roleid ? "1" : request.payload.roleid
                        const user = new UserSchema(request.payload)
                        user
                            .save()
                            .then(data => {
                                return resolve(reply.response({ Message: "User created successfully" }).code(201));
                            })
                            .catch(err => {
                                console.log(err.message)
                                return resolve(reply.response(err.message).code(500));
                            });
                    }).catch(err => {
                        console.log(err.message)
                        return resolve(reply.response(err.message).code(500));
                    })
                }
            }).catch(err => {
                console.log(err.message)
                return resolve(reply.response(err.message).code(500));
            })
        }
        catch (err) {
            console.log(err.message)
            return resolve(reply.response(err.message).code(500));
        }
    });
}

export const getAll = function (request, reply) {
    return new Promise(async (resolve, reject) => {
        try {
            UserSchema.find({}).then(result => {
                return resolve(reply.response(result).code(200));
            }).catch(err => {
                console.log(err.message)
                return resolve(reply.response(err.message).code(500));
            })
        }
        catch (err) {
            console.log(err.message)
            return resolve(reply.response(err.message).code(500));
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
                    console.log(err.message)
                    return resolve(reply.response(err.message).code(500));
                });
        }
        catch (err) {
            console.log(err.message)
            return resolve(reply.response(err.message).code(500));
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
                    console.log(err.message)
                    return resolve(reply.response(err.message).code(500));
                });
        }
        catch (err) {
            console.log(err.message)
            return resolve(reply.response(err.message).code(500));
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
                    console.log(err.message)
                    return resolve(reply.response(err.message).code(500));
                });
        }
        catch (err) {
            console.log(err.message)
            return resolve(reply.response(err.message).code(500));
        }
    });
}











