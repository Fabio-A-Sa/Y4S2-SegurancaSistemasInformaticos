import request from "supertest"
import { app, PUBLIC_KEY } from "../index.js";
import { checkServerSignature, decryptAES128, decryptAES256, encryptAES128, encryptAES256, sign } from "../utils.js";

export const testUtils_preRegister = async (fullName, securityLevel) => {
    const res = await request(app)
        .post('/preregister/')
        .send({ fullName, securityLevel });

    if(res.statusCode == 400) return res

    return res.body;
};

export const testUtils_register = async (username, oneTimeId) => {
    const message = encryptAES128("REGISTER", oneTimeId);
    const res = await request(app)
        .post(`/register/`)
        .send({"username": username, "message": message})

    if(res.statusCode == 400) return res

    checkServerSignature(res, PUBLIC_KEY)

    return JSON.parse(decryptAES128(res.body.message, oneTimeId))
}

export const testUtils_registerAck = async (data) => {
    const message = encryptAES256(JSON.stringify({message: "REGISTER_ACK", nonce: data.nonce + 1}), data.sessionKey)
    const signature = sign(JSON.stringify(message), data.privateKey)

    return await request(app)
        .post('/registerack/')
        .send({"sessionID": data.sessionID, "message": message, "signature": signature})
}

export const testUtils_operation = async (sessionID, privateKey, sessionKey, message, nonce) => {
    message = encryptAES256(JSON.stringify({message: message, nonce: nonce}), sessionKey)
    let signature = sign(JSON.stringify(message), privateKey)

    const res = await request(app)
        .post(`/operation/`)
        .send({"sessionID": sessionID, "message": message, "signature": signature})

    if(res.statusCode == 400) return res

    checkServerSignature(res, PUBLIC_KEY)
    return JSON.parse(decryptAES256(res.body.message, sessionKey))
}