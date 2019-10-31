import RoleAccessSchema from './model';

export const create = function (request, reply) {
    const roleaccess = new RoleAccessSchema(request.payload)
    return new Promise(async (resolve, reject) => {
        try {
            roleaccess
                .save()
                .then(data => {
                    return resolve(reply.response({ Message: "Created successfully" }).code(200));
                })
                .catch(err => {
                    return resolve(reply.response({
                        message: err.message || "error occurred while creating."
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
            RoleAccessSchema.find({}).then(result => {
                return resolve(reply.response(result).code(200));
            }).catch(err => {
                return resolve(reply.response({
                    message: err.message
                }));
            })
        }
        catch (err) {
            return resolve(reply.response(err));
        }
    });
}


export const updateRoleAccessById = function (request, reply) {
    return new Promise(async (resolve, reject) => {
        try {
            await RoleAccessSchema.findOneAndUpdate({ _id: request.params.id }, request.payload, { new: false })
                .then(result => {
                    return resolve(reply.response({ Message: `${result.name} Updated Successfully` }).code(200));
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


export const deleteRoleAccessById = function (request, reply) {
    return new Promise(async (resolve, reject) => {
        try {
            await RoleAccessSchema.deleteOne({ _id: request.params.id })
                .then(result => {
                    if (result.deletedCount > 0)
                        return resolve(reply.response({ Message: `${request.params.id} Deleted Successfully` }).code(200));
                    else
                        return resolve(reply.response({ Message: "No records found" }).code(200));
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




export const findRoleAccessById = function (request, reply) {
    return new Promise(async (resolve, reject) => {
        try {
            await RoleAccessSchema.findById({ _id: request.params.id })
                .then(result => {
                    return resolve(reply.response(result).code(200));
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
























