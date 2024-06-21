import "chai/register-should.js";
import { testUtils_preRegister, testUtils_register, testUtils_registerAck } from "./utils.js";

describe('Registration', () => {
    let username;
    let oneTimeId;
    let data;

    before(async () => {
        const body = await testUtils_preRegister("Teste", "3")
        username = body.username;
        oneTimeId = body.oneTimeId;
    });

    it('Valid Data', async () => {
        const data = await testUtils_register(username, oneTimeId);

        data.should.have.property('privateKey');
        data.should.have.property('sessionKey');
        data.should.have.property('sessionID');
        data.should.have.property('nonce');

        await testUtils_registerAck(data)
    });

    it('Register same user again', async () => {
        const res = await testUtils_register(username, oneTimeId);
        res.status.should.equal(400)
    });

    it('Simulate loss of server response and try to register again', async () => {
        const body = await testUtils_preRegister("Teste", "3")
        username = body.username;
        oneTimeId = body.oneTimeId;

        data = await testUtils_register(username, oneTimeId);

        data.should.have.property('privateKey');
        data.should.have.property('sessionKey');
        data.should.have.property('sessionID');
        data.should.have.property('nonce');

        data = await testUtils_register(username, oneTimeId);

        data.should.have.property('privateKey');
        data.should.have.property('sessionKey');
        data.should.have.property('sessionID');
        data.should.have.property('nonce');

        await testUtils_registerAck(data)
    });

    it('Try to ack two times', async () => {
        const res = await testUtils_registerAck(data)
        res.status.should.equal(400)
    });
});
