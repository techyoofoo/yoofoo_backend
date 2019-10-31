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
                    const group = new GroupSchema(request.payload);
                    group
                        .save()
                        .then(data => {
                            return resolve(reply.response({ Message: "Group saved successfully" }).code(200));
                        })
                        .catch(err => {
                            return resolve(reply.response({
                                message: err.message || "error occurred while creating the group."
                            }));
                        });
                }
            }).catch(err => {
                    return resolve(reply.response({
                        message: err.message || "error occurred while creating the group."
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
            GroupSchema.find({}).then(result => {
                return resolve(reply.response(result).code(200));
            }).catch(err => {
                return resolve(reply.response({
                    message: err.message || "error occurred while retrieve the groups."
                }));
            })
        }
        catch (err) {
            return resolve(reply.response(err));
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
                    return resolve(reply.response({
                        message: err.message || "error occurred while updating  group."
                    }));
                });
        }
        catch (err) {
            return resolve(reply.response(err));
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
                    return resolve(reply.response({
                        message: err.message || "error occurred while deleting group."
                    }));
                });
        }
        catch (err) {
            return resolve(reply.response(err));
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











