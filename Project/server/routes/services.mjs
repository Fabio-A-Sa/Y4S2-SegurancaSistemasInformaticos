import { PRIVATE_KEY } from "../index.js";
import { decryptAES256, encryptAES256, getFromUser, postData, sign, updateUser, verifyUserSignature } from "../utils.js"

export default function servicesRoutes(app) {
    app.post('/operation', async (req, res) => {
        try {
            const { sessionID, message, signature } = postData(req, ['sessionID', 'message', 'signature']);

            console.log('\n=============== Received request to services:')
            console.log(`Session ID: ${sessionID}`)
            console.log(`Message: ${JSON.stringify(message)}`)
            console.log(`Signature: ${signature}`)
            console.log()

            await verifyUserSignature(['session_id', sessionID], message, signature)

            console.log('Signature OK.')

            const { session_key, security_level, nonce } = await getFromUser(['session_key', 'security_level', 'nonce'], 'session_id', sessionID)
            if(!session_key) throw new Error('Invalid Session');

            let payload = decryptAES256(message, session_key)
            
            try{ payload = JSON.parse(payload) } 
            catch{ throw new Error('Invalid Message'); }

            if(payload.nonce <= nonce) throw new Error('Invalid nonce');

            console.log(`Decrypted message: ${JSON.stringify(payload.message)}`)

            let result;
            const operation = payload.message.op;
            const value = payload.message.value;
            const root = payload.message.root;
            switch(operation){
                case 'SQUAREROOT':
                    result = Math.sqrt(value)
                    break;
                case 'CUBICROOT':
                    if(security_level < 2) throw new Error('No Permission');
                    result = Math.cbrt(value)
                    break;
                case 'NROOT':
                    if(security_level < 3) throw new Error('No Permission');
                    if (root <= 0) throw new Error('Invalid Root');
                    result = Math.pow(value, 1 / root);
                    break;
                default:
                    throw new Error('Invalid Operation');
            }

            await updateUser({'nonce': payload.nonce}, {'session_id': sessionID})

            console.log('Sending this information encrypted and signed:')
            console.log({'result': result})

            let _message = encryptAES256(JSON.stringify({'result': result}), session_key)
            let _signature = sign(JSON.stringify(_message), PRIVATE_KEY, 'jmcruz')
            res.status(200).send({"message": _message, "signature": _signature})
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    });
}
