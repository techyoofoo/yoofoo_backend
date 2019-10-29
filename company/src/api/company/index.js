import CompanySchema from "./model";


export const create = function (request, reply) {
    const company = new CompanySchema(request.payload)
    return new Promise(async (resolve, reject) => {
        try {
            company
                .save()
                .then(data => {
                    return resolve(reply.response({ Message: "Company registered sucessfully" }).code(200));
                })
                .catch(err => {
                    return resolve(reply.response({
                        message: err.message || "error occurred while creating the Company."
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
            CompanySchema.find({}).then(result => {
                return resolve(reply.response(result).code(200));
            }).catch(err => {
                return resolve(reply.response({
                    message: err.message || "error occurred while retrieve the companies."
                }));
            })
        }
        catch (err) {
            return resolve(reply.response(err));
        }
    });
}

export const updateCompanyById = function (request, reply) {
    return new Promise(async (resolve, reject) => {
        try {
            await CompanySchema.findOneAndUpdate({ _id: request.params.id }, request.payload, { new: false })
                .then(ComapanyInfo => {
                    return resolve(reply.response({ Message: `${ComapanyInfo.name} Updated Successfully` }).code(200));
                })
                .catch(err => {
                    return resolve(reply.response({
                        message: err.message || "error occurred while updating company."
                    }));
                });
        }
        catch (err) {
            return resolve(reply.response(err));
        }
    });
}


export const deleteCompanyById = function (request, reply) {
    return new Promise(async (resolve, reject) => {
        try {
            await CompanySchema.deleteOne({ _id: request.params.id })
                .then(CompanyInfo => {
                    if (CompanyInfo.deletedCount > 0)
                        return resolve(reply.response({ Message: `${request.params.id} Deleted Successfully` }).code(200));
                    else
                        return resolve(reply.response({ Message: "No records found" }).code(200));
                })
                .catch(err => {
                    return resolve(reply.response({
                        message: err.message || "error occurred while deleting company."
                    }));
                });
        }
        catch (err) {
            return resolve(reply.response(err));
        }
    });
}

export const findCompanyById = function (request, reply) {
    return new Promise(async (resolve, reject) => {
        try {
            await CompanySchema.findById({ _id: request.params.id })
                .then(CompanyInfo => {
                    return resolve(reply.response(CompanyInfo).code(200));
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











