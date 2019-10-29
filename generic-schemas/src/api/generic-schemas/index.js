import mongoose, { Schema } from "mongoose";
import schema from './model';


export const create = function (request, reply) {
    const model = mongoose.model(request.params.table_name, schema);
    const create = new model(request.payload);
    return new Promise(async (resolve, reject) => {
        try {
            create
                .save()
                .then(data => {
                    return resolve(reply.response({ id: data._id, Message: "Created successfully" }).code(200));
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
    const model = mongoose.model(request.params.table_name, schema);
    return new Promise(async (resolve, reject) => {
        try {
            model.find({}).then(result => {
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

export const updateById = function (request, reply) {
    const model = mongoose.model(request.params.table_name, schema);
    return new Promise(async (resolve, reject) => {
        try {
            await model.findOneAndUpdate({ _id: request.params.id }, request.payload, { new: false })
                .then(result => {
                    return resolve(reply.response({ id: result._id, Message: `Updated Successfully` }).code(200));
                })
                .catch(err => {
                    return resolve(reply.response({
                        message: err.message || "error occurred while updating."
                    }));
                });
        }
        catch (err) {
            return resolve(reply.response(err));
        }
    });
}


export const deleteById = function (request, reply) {
    const model = mongoose.model(request.params.table_name, schema);
    return new Promise(async (resolve, reject) => {
        try {
            await model.deleteOne({ _id: request.params.id })
                .then(result => {
                    if (result.deletedCount > 0)
                        return resolve(reply.response({ Message: `${request.params.id} Deleted Successfully` }).code(200));
                    else
                        return resolve(reply.response({ Message: "No records found" }).code(200));
                })
                .catch(err => {
                    return resolve(reply.response({
                        message: err.message || "error occurred while deleting."
                    }));
                });
        }
        catch (err) {
            return resolve(reply.response(err));
        }
    });
}


export const findById = function (request, reply) {
    const model = mongoose.model(request.params.table_name, schema);
    return new Promise(async (resolve, reject) => {
        try {
            await model.findById({ _id: request.params.id })
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











