import "chai/register-should.js";
import { db } from "../db.js"
import { testUtils_operation, testUtils_preRegister, testUtils_register, testUtils_registerAck } from "./utils.js";

after((done) => {
    db.run("DELETE FROM user WHERE full_name LIKE 'Teste%'", () => {
        done()
    })
})

let sessionID;
let privateKey;
let sessionKey;
let nonce;

async function register(security_level){
    const body = await testUtils_preRegister("Teste", security_level)
    const data = await testUtils_register(body.username, body.oneTimeId);
    sessionID = data.sessionID
    sessionKey = data.sessionKey
    privateKey = data.privateKey
    nonce = data.nonce
    await testUtils_registerAck(data)
    nonce++
}

describe('Services', () => {
    it('Valid Square Root', async () => {
        await register(1)
        const res = await testUtils_operation(
            sessionID, privateKey, sessionKey, {'op': 'SQUAREROOT', 'value': 4}, ++nonce
        )
        res.result.should.equal(2)
    });
    it('No Permission Cubic Root', async () => {
        const res = await testUtils_operation(
            sessionID, privateKey, sessionKey, {'op': 'CUBICROOT', 'value': 8}, ++nonce
        )
        res.status.should.equal(400)
    });
    it('Valid Cubic Root', async () => {
        await register(2)
        const res = await testUtils_operation(
            sessionID, privateKey, sessionKey, {'op': 'CUBICROOT', 'value': 8}, ++nonce
        )
        res.result.should.equal(2)
    });
    it('No Permission N Root', async () => {
        const res = await testUtils_operation(
            sessionID, privateKey, sessionKey, {'op': 'NROOT', 'value': 16, 'root': 4}, ++nonce
        )
        res.status.should.equal(400)
    });
    it('Valid N Root', async () => {
        await register(3)
        const res = await testUtils_operation(
            sessionID, privateKey, sessionKey, {'op': 'NROOT', 'value': 16, 'root': 4}, ++nonce
        )
        res.result.should.equal(2)
    });
    it('Replay Attack', async () => {
        await register(3)
        let res = await testUtils_operation(
            sessionID, privateKey, sessionKey, {'op': 'NROOT', 'value': 16, 'root': 4}, ++nonce
        )
        res.result.should.equal(2)

        res = await testUtils_operation(
            sessionID, privateKey, sessionKey, {'op': 'NROOT', 'value': 16, 'root': 4}, nonce
        )
        res.status.should.equal(400)
    });
});
