import ProductSchema from './model';


export const create = function (request, reply) {
    const product = new ProductSchema(request.payload)
    return new Promise(async (resolve, reject) => {
        try {
            product
                .save()
                .then(data => {
                    return resolve(reply.response({ Message: "Product registered successfully" }).code(200));
                })
                .catch(err => {
                    return resolve(reply.response({
                        message: err.message || "error occurred while registering product."
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
            ProductSchema.find({}).then(result => {
                return resolve(reply.response(result).code(200));
            }).catch(err => {
                return resolve(reply.response({
                    message: err.message || "error occurred while retrieve the products."
                }));
            })
        }
        catch (err) {
            return resolve(reply.response(err));
        }
    });
}

export const updateProductById = function (request, reply) {
    return new Promise(async (resolve, reject) => {
        try {
            await ProductSchema.findOneAndUpdate({ _id: request.params.id }, request.payload, { new: false })
                .then(ProductInfo => {
                    return resolve(reply.response({ Message: `${ProductInfo.name} Updated Successfully` }).code(200));
                })
                .catch(err => {
                    return resolve(reply.response({
                        message: err.message || "error occurred while updating product."
                    }));
                });
        }
        catch (err) {
            return resolve(reply.response(err));
        }
    });
}

export const deleteProductById = function (request, reply) {
    return new Promise(async (resolve, reject) => {
        try {
            await ProductSchema.deleteOne({ _id: request.params.id })
                .then(ProductInfo => {
                    if (ProductInfo.deletedCount > 0)
                        return resolve(reply.response({ Message: `${request.params.id} Deleted Successfully` }).code(200));
                    else
                        return resolve(reply.response({ Message: "No records found" }).code(200));
                })
                .catch(err => {
                    return resolve(reply.response({
                        message: err.message || "error occurred while deleting product."
                    }));
                });
        }
        catch (err) {
            return resolve(reply.response(err));
        }
    });
}

export const findProductById = function (request, reply) {
    return new Promise(async (resolve, reject) => {
        try {
            await ProductSchema.findById({ _id: request.params.id })
                .then(ProductInfo => {
                    return resolve(reply.response(ProductInfo).code(200));
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











