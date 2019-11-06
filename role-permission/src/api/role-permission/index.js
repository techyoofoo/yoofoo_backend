import RolePermissionSchema from './model';

export const create = function (request, reply) {
    return new Promise(async (resolve, reject) => {
        try {
            RolePermissionSchema.find({
                name: request.payload.name,
                roleid: request.payload.roleid
            }).then(result => {
                if (result.length !== 0)
                    return resolve(reply.response({ Message: request.payload.name + " already exist with same role, you can update the permission." }).code(200));
                else {
                    const rolepermission = new RolePermissionSchema(request.payload)
                    rolepermission
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
            RolePermissionSchema.find({}).then(result => {
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


export const updateRolePermissionById = function (request, reply) {
    return new Promise(async (resolve, reject) => {
        try {
            await RolePermissionSchema.findOneAndUpdate({ _id: request.params.id }, request.payload, { new: false })
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


export const deleteRolePermissionById = function (request, reply) {
    return new Promise(async (resolve, reject) => {
        try {
            await RolePermissionSchema.deleteOne({ _id: request.params.id })
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




export const findRolePermissionById = function (request, reply) {
    return new Promise(async (resolve, reject) => {
        try {
            await RolePermissionSchema.findById({ _id: request.params.id })
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
























