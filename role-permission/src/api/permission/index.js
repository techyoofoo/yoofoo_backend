import PermissionSchema from './model';

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


































