import request from "supertest"
import { PUBLIC_KEY, app } from "../index.js";
import "chai/register-should.js";
import { checkServerSignature, decryptRSA, encryptRSA, sign } from "../utils.js";
import { testUtils_preRegister, testUtils_register, testUtils_registerAck } from "./utils.js";

describe('Login', () => {
    let username;
    let privateKey;
    let nonce;

    before(async () => {
        const body = await testUtils_preRegister("Teste", "3")
        username = body.username
        const data = await testUtils_register(body.username, body.oneTimeId);

        data.should.have.property('privateKey');
        data.should.have.property('sessionKey');
        data.should.have.property('sessionID');
        data.should.have.property('nonce');

        privateKey = data.privateKey
        nonce = data.nonce

        const res = await testUtils_registerAck(data)
        res.status.should.equal(200)
    });

    it('Valid Data', (done) => {
        const message = encryptRSA(JSON.stringify({message:'LOGIN', nonce: nonce + 2}), PUBLIC_KEY)
        const signature = sign(message, privateKey)

        request(app)
        .post(`/login/`)
        .send({"username": username, "message": message, "signature": signature})
        .expect('Content-Type', /json/)
        .expect(200)
        .then((res) => {
            checkServerSignature(res, PUBLIC_KEY)

            const data = JSON.parse(decryptRSA(res.body.message, privateKey))
            
            data.should.have.property('sessionKey');
            data.should.have.property('sessionID');

            done()
        })
    });

    it('Replay Attack', async () => {
        const message = encryptRSA(JSON.stringify({message:'LOGIN', nonce: nonce + 3}), PUBLIC_KEY)
        const signature = sign(message, privateKey)

        let res = await request(app)
        .post(`/login/`)
        .send({"username": username, "message": message, "signature": signature})
        
        res.status.should.equal(200)

        res = await request(app)
        .post(`/login/`)
        .send({"username": username, "message": message, "signature": signature})
        
        res.status.should.equal(400)
    })
});
