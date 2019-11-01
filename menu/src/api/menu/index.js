import MenuSchema from './model';


export const create = function (request, reply) {

    return new Promise(async (resolve, reject) => {
        try {
            MenuSchema.find({
                name: request.payload.name
            }).then(result => {
                if (result.length !== 0)
                    return resolve(reply.response({ Message: "Menu already exist" }).code(200));
                else {
                    MenuSchema.find({}).then(data => {
                        request.payload.id = data.length + 1
                        const menu = new MenuSchema(request.payload)
                        menu
                            .save()
                            .then(data => {
                                return resolve(reply.response({ Message: "Created successfully" }).code(201));
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
            MenuSchema.find({}).then(result => {
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

export const updateMenuById = function (request, reply) {
    return new Promise(async (resolve, reject) => {
        try {
            await MenuSchema.findOneAndUpdate({ _id: request.params.id }, request.payload, { new: false })
                .then(MenuInfo => {
                    return resolve(reply.response({ Message: `${MenuInfo.name} Updated Successfully` }).code(200));
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


export const deleteMenuById = function (request, reply) {
    return new Promise(async (resolve, reject) => {
        try {
            await MenuSchema.deleteOne({ _id: request.params.id })
                .then(MenuInfo => {
                    if (MenuInfo.deletedCount > 0)
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


export const findMenuById = function (request, reply) {
    return new Promise(async (resolve, reject) => {
        try {
            await MenuSchema.findById({ _id: request.params.id })
                .then(MenuInfo => {
                    return resolve(reply.response(MenuInfo).code(200));
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
















