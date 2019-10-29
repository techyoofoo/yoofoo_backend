import ServerSchema from "./model";

const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

export const create = function (request, reply) {
    var encrypted = encrypt(JSON.stringify(request.payload));
    const server = new ServerSchema({ name: request.payload.name, clientid: request.payload.clientid, iv: encrypted.iv, key: encrypted.key, connection: encrypted.encryptedData });
    return new Promise(async (resolve, reject) => {
        try {
            server
                .save()
                .then(data => {
                    return resolve(reply.response({ id: data._id, message: "Database configuration saved successfully." }).code(200));
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

export const findServerById = function (request, reply) {
    return new Promise(async (resolve, reject) => {
        try {
            await ServerSchema.findById({ _id: request.params.id })
                .then(ServerInfo => {
                    let conString = decrypt(ServerInfo);
                    return resolve(reply.response({ clientid: ServerInfo.clientid, name: ServerInfo.name, connection: JSON.parse(conString) }).code(200));
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


function encrypt(text) {
    let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return { iv: iv.toString('hex'), key: key.toString('hex'), encryptedData: encrypted.toString('hex') };
}

function decrypt(text) {
    let iv = Buffer.from(text.iv, 'hex');
    let encryptedText = Buffer.from(text.connection, 'hex');
    let key = Buffer.from(text.key, 'hex');
    let decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}











