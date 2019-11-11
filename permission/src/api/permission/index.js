import PermissionSchema from './model';

export const create = function (request, reply) {
    return new Promise(async (resolve, reject) => {
        try {
            PermissionSchema.find({
                name: request.payload.name
            }).then(result => {
                if (result.length !== 0)
                    return resolve(reply.response({ Message: request.payload.name + " already exist." }).code(200));
                else {
                    const permission = new PermissionSchema(request.payload)
                    permission
                        .save()
                        .then(data => {
                            return resolve(reply.response({ Message: "Created successfully" }).code(201));
                        })
                        .catch(err => {
                            console.log(err.message)
                            return resolve(reply.response(err.message).code(500));
                        });
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
            PermissionSchema.find({ state: "enable" }).then(result => {
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

export const updatePermissionById = function (request, reply) {
    return new Promise(async (resolve, reject) => {
        try {
            await PermissionSchema.findOneAndUpdate({ _id: request.params.id }, request.payload, { new: false })
                .then(result => {
                    return resolve(reply.response({ Message: `${result.name} Updated Successfully` }).code(200));
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

export const deletePermissionById = function (request, reply) {
    return new Promise(async (resolve, reject) => {
        try {
            await PermissionSchema.deleteOne({ _id: request.params.id })
                .then(result => {
                    if (result.deletedCount > 0)
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


export const findPermissionById = function (request, reply) {
    return new Promise(async (resolve, reject) => {
        try {
            await PermissionSchema.findById({ _id: request.params.id })
                .then(result => {
                    return resolve(reply.response(result).code(200));
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




































