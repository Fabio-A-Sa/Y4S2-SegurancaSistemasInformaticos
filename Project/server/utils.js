import crypto from "crypto";
import { db } from "./db.js"

// ==============================================================================
//  Database Wrappers
// ==============================================================================

export function runQuery(sql, params) {
    return new Promise((resolve, reject) => {
        if (sql.trim().toUpperCase().startsWith("SELECT")) {
            db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        } else {
            db.run(sql, params, function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        }
    });
}


export function getUser(fields, where, value) {
    return new Promise((resolve, reject) => {
        if (!fields || (Array.isArray(fields) && fields.length === 0)) {
            reject('Invalid fields');
            return;
        }

        const fieldList = Array.isArray(fields) ? fields.join(', ') : fields;
        const sql = `SELECT ${fieldList} FROM user WHERE ${where} = ?`;

        db.get(sql, [value], (err, row) => {
            if (err) {
                reject(err);
            } else {
                if (row) {
                    if (Array.isArray(fields)) {
                        const result = {};
                        fields.forEach(field => {
                            result[field] = row[field];
                        });
                        resolve(result);
                    } else {
                        resolve(row[fields]);
                    }
                }
            }
        });
    });
}

export function getFromUser(fields, where, value) {
    return new Promise((resolve, reject) => {
        if (!fields || (Array.isArray(fields) && fields.length === 0)) {
            reject('Invalid fields');
            return;
        }

        const fieldList = Array.isArray(fields) ? fields.join(', ') : fields;
        const sql = `SELECT ${fieldList} FROM user WHERE ${where} = ?`;

        db.get(sql, [value], (err, row) => {
            if (err) {
                reject(err);
            } else {
                if (row) {
                    if (Array.isArray(fields)) {
                        const result = {};
                        fields.forEach(field => {
                            result[field] = row[field];
                        });
                        resolve(result);
                    } else {
                        resolve(row[fields]);
                    }
                } else {
                    reject(`Invalid ${where}`);
                }
            }
        });
    });
}

export function updateUser(updates, where) {
    if (!updates || typeof updates !== 'object' || Object.keys(updates).length === 0 ||
     !where || typeof where !== 'object' || Object.keys(where).length !== 1) {
        return Promise.reject('Invalid updates or where condition');
    }

    const setClauses = Object.keys(updates).map(field => `${field} = ?`).join(', ');
    const whereField = Object.keys(where)[0];
    const whereValue = where[whereField];
    const sql = `UPDATE user SET ${setClauses} WHERE ${whereField} = ?`;
    const params = [...Object.values(updates), whereValue];
    return runQuery(sql, params);
}


// ==============================================================================
// Crypto Wrappers
// ==============================================================================

export function generateRandomBytes(length){
    return crypto.randomBytes(Math.ceil(length / 2))
        .toString('hex')
        .slice(0, length);
}

export function generateUserKeys(){
    return crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
            type: 'pkcs1',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs1',
            format: 'pem',
        }
    });
}

export function sign(value, privateKey, passphrase=undefined) {
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(value);
    return sign.sign({key: privateKey, passphrase: passphrase}, 'base64');
}

export function verify_sign(value, signature, publicKey) {
    const verify = crypto.createVerify('RSA-SHA256');
    verify.update(value);
    return verify.verify(publicKey, signature, 'base64');
}

export function encrypt(alg, payload, key){
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(alg, key, iv);  
    let encrypted = cipher.update(payload, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag();
    return {
        iv: iv.toString('hex'),
        payload: encrypted,
        tag: tag.toString('hex')
    };
}

export function encryptAES128(message, key){
    return encrypt('aes-128-gcm', message, key)
}

export function encryptAES256(message, key){
    return encrypt('aes-256-gcm', message, key)
}

export function decrypt(alg, message, key){
    const decipher = crypto.createDecipheriv(alg, key, Buffer.from(message.iv, 'hex'));
    decipher.setAuthTag(Buffer.from(message.tag, 'hex'));
    let decrypted = decipher.update(message.payload, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

export function decryptAES128(message, key){
    return decrypt('aes-128-gcm', message, key)
}

export function decryptAES256(message, key){
    return decrypt('aes-256-gcm', message, key)
}

export function encryptRSA(data, publicKey) {
    const encryptedData = crypto.publicEncrypt(
        {
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_PADDING
        },
        Buffer.from(data)
    );
    return encryptedData.toString('base64');
}

export function decryptRSA(encryptedData, privateKey, passphrase=undefined) {
    const decryptedData = crypto.privateDecrypt(
        {
            key: privateKey,
            padding: crypto.constants.RSA_PKCS1_PADDING,
            passphrase: passphrase
        },
        Buffer.from(encryptedData, 'base64')
    );
    return decryptedData.toString();
}

export async function verifyUserSignature(user, message, signature){
    const userPublicKey = await getFromUser('public_key', ...user)
    const authenticated = verify_sign(JSON.stringify(message), signature, userPublicKey)
    if(!authenticated) throw new Error('Invalid Signature');
}

// ==============================================================================
//  Others
// ==============================================================================

export function postData(req, fields) {
    const extractedFields = {};
    for (const field of fields) {
        if (!req.body[field]) {
            throw new Error(`Invalid ${field.charAt(0).toUpperCase() + field.slice(1)}`);
        }
        extractedFields[field] = req.body[field];
    }
    return extractedFields;
}

export function generateUsername(fullName){
    const words = fullName.trim().split(' ');
    const initials = words.map(word => word.charAt(0)).join('').toUpperCase();
    const randomDigits = Math.floor(Math.random() * 1000);
    return initials + randomDigits;
}

// ==============================================================================
//  Testing Utils
// ==============================================================================

export function checkServerSignature(response, key){
    if(!verify_sign(JSON.stringify(response.body.message), response.body.signature, key))
        throw new Error('Invalid server signature')
}