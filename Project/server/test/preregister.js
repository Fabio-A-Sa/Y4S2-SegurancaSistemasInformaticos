import "chai/register-should.js";
import { testUtils_preRegister } from "./utils.js";

describe('Pre-Registration', () => {
    it('Valid Data (Sec. Level 1)', async () => {
        const body = await testUtils_preRegister("Teste", "1")
        body.should.have.property('username');
        body.should.have.property('oneTimeId');
    });
    it('Valid Data (Sec. Level 2)', async () => {
        const body = await testUtils_preRegister("Teste", "2")
        body.should.have.property('username');
        body.should.have.property('oneTimeId');
    });
    it('Valid Data (Sec. Level 3)', async () => {
        const body = await testUtils_preRegister("Teste", "3")
        body.should.have.property('username');
        body.should.have.property('oneTimeId');
    });
    it('Invalid Data (Sec. Level 0)', async () => {
        const res = await testUtils_preRegister("Teste", "0")
        res.status.should.equal(400)
    });
    it('Invalid Data (Sec. Level 4)', async () => {
        const res = await testUtils_preRegister("Teste", "4")
        res.status.should.equal(400)
    });
    it('Invalid Data (Missing Full Name)', async () => {
        const res = await testUtils_preRegister(null, "0")
        res.status.should.equal(400)
    });
    it('Invalid Data (Missing Sec. Level)', async () => {
        const res = await testUtils_preRegister("Teste", null)
        res.status.should.equal(400)
    });
    it('Invalid Data (No data)', async () => {
        const res = await testUtils_preRegister()
        res.status.should.equal(400)
    });
});
