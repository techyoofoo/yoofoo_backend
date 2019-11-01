import GroupSchema from './model';


export const create = function (request, reply) {
    return new Promise(async (resolve, reject) => {
        try {
            GroupSchema.find({
                name: request.payload.name
            }).then(result => {
                if (result.length !== 0)
                    return resolve(reply.response({ Message: "Group already exist" }).code(200));
                else {
                    GroupSchema.find({}).then(data => {
                        request.payload.clientid = data.length + 1
                        const group = new GroupSchema(request.payload);
                        group
                            .save()
                            .then(data => {
                                return resolve(reply.response({ Message: "Group created successfully" }).code(201));
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
            });
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
            GroupSchema.find({}).then(result => {
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

export const updateGroupById = function (request, reply) {
    return new Promise(async (resolve, reject) => {
        try {
            await GroupSchema.findOneAndUpdate({ _id: request.params.id }, request.payload, { new: false })
                .then(GroupInfo => {
                    return resolve(reply.response({ Message: `${GroupInfo.name} Updated Successfully` }).code(200));
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


export const deleteGroupById = function (request, reply) {
    return new Promise(async (resolve, reject) => {
        try {
            await GroupSchema.deleteOne({ _id: request.params.id })
                .then(GroupInfo => {
                    if (GroupInfo.deletedCount > 0)
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

export const findGroupById = function (request, reply) {
    return new Promise(async (resolve, reject) => {
        try {
            GroupSchema.findById({ _id: request.params.id })
                .then(GroupInfo => {
                    return resolve(reply.response(GroupInfo).code(200));
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











