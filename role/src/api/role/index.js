import RoleSchema from './model';

export const create = function (request, reply) {
    return new Promise(async (resolve, reject) => {
        try {
            RoleSchema.find({
                name: request.payload.name,
            }).then(result => {
                if (result.length !== 0)
                    return resolve(reply.response({ Message: "Role already exist" }).code(200));
                else {
                    const createRole = new RoleSchema(request.payload);
                    createRole
                        .save()
                        .then(data => {
                            return resolve(reply.response({ Message: "Role saved successfully" }).code(200));
                        })
                        .catch(err => {
                            return resolve(reply.response({
                                message: err.message || "error occurred while creating the role."
                            }));
                        });
                }
            }).catch(err => {
                return resolve(reply.response({
                    message: err.message || "error occurred while creating the role."
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
            RoleSchema.find({}).then(result => {
                return resolve(reply.response(result).code(200));
            }).catch(err => {
                return resolve(reply.response({
                    message: err.message || "error occurred while retrieve roles."
                }));
            })
        }
        catch (err) {
            return resolve(reply.response(err));
        }
    });
}

export const updateRoleById = function (request, reply) {
    return new Promise(async (resolve, reject) => {
        try {
            await RoleSchema.findOneAndUpdate({ _id: request.params.id }, request.payload, { new: false })
                .then(RoleInfo => {
                    return resolve(reply.response({ Message: `${RoleInfo.name} Updated Successfully` }).code(200));
                })
                .catch(err => {
                    return resolve(reply.response({
                        message: err.message || "error occurred while updating role."
                    }));
                });
        }
        catch (err) {
            return resolve(reply.response(err));
        }
    });
}

export const deleteRoleById = function (request, reply) {
    return new Promise(async (resolve, reject) => {
        try {
            await RoleSchema.deleteOne({ _id: request.params.id })
                .then(RoleInfo => {
                    if (RoleInfo.deletedCount > 0)
                        return resolve(reply.response({ Message: `${request.params.id} Deleted Successfully` }).code(200));
                    else
                        return resolve(reply.response({ Message: "No records found" }).code(200));
                })
                .catch(err => {
                    return resolve(reply.response({
                        message: err.message || "error occurred while deleting role."
                    }));
                });
        }
        catch (err) {
            return resolve(reply.response(err));
        }
    });
}

export const findRoleById = function (request, reply) {
    return new Promise(async (resolve, reject) => {
        try {
            await RoleSchema.findById({ _id: request.params.id })
                .then(RoleInfo => {
                    return resolve(reply.response(RoleInfo).code(200));
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












