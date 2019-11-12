import RolePermissionSchema from './model';

export const create = function (request, reply) {
    return new Promise(async (resolve, reject) => {
        try {
            RolePermissionSchema.find({
                roleid: request.payload.roleid
            }).then(result => {
                if (result.length !== 0)
                    return resolve(reply.response({ _id: result[0]._id, Message: "Permissions already exist with same role" }).code(200));
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
                    return resolve(reply.response({ Message: `Updated Successfully` }).code(200));
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


export const removePermissionFromRolePermission = function (request, reply) {
    return new Promise(async (resolve, reject) => {
        try {
            await RolePermissionSchema.find({})
                .then(result => {
                    result.forEach((d, i) => {
                        var index = d.permission.indexOf(request.params.id)
                        if (index !== -1) {
                            d.permission = d.permission.filter(x=>x !== request.params.id)
                            RolePermissionSchema.findOneAndUpdate({ _id: d._id }, { permission: d.permission }, { new: false })
                                .catch(err => {
                                    console.log(err.message)
                                });
                        }
                    })
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


























