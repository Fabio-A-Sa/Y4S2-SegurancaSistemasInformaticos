import crypto from "crypto";
import { sign, getFromUser, verifyUserSignature, postData, updateUser, generateUserKeys, decryptAES128, encryptAES128, decryptAES256 } from "../utils.js"
import { PRIVATE_KEY } from "../index.js";

export default function registerRoutes(app) {
    app.post('/register', async (req, res) => {
        try {
            const { username, message } = postData(req, ['username', 'message']);

            console.log('\n=============== Received request to register:')
            console.log(`Username: ${username}`)
            console.log(`Message: ${JSON.stringify(message)}`)
            console.log()

            const { one_time_id, status, security_level } = await getFromUser(['one_time_id', 'status', 'security_level'], 'username', username)
            if(status > 0) throw new Error('Invalid request') // Already registered

            const result = decryptAES128(message, one_time_id)
            console.log(`Decrypted message: ${result}`)

            if(result == 'REGISTER'){
                console.log('Generate user keys...')
                const { privateKey, publicKey } = generateUserKeys();
                const sessionKey = crypto.randomBytes(16).toString('hex');
                const sessionID = crypto.randomBytes(16).toString('hex');
                const nonce = Math.floor(Math.random() * 1e9); // It could be public

                await updateUser({'public_key': publicKey, 'session_key': sessionKey, 'session_id': sessionID, 'nonce': nonce}, {'username': username})
                
                console.log('Sending this information encrypted and signed:')
                console.log({ 
                    privateKey: privateKey,
                    sessionID: sessionID,
                    sessionKey: sessionKey,
                    security_level: security_level,
                    nonce: nonce
                })

                const message = encryptAES128(JSON.stringify({ 
                    privateKey: privateKey,
                    sessionID: sessionID,
                    sessionKey: sessionKey,
                    security_level: security_level,
                    nonce: nonce
                }), one_time_id)

                res.status(200).json({
                    message: message,
                    signature: sign(JSON.stringify(message), PRIVATE_KEY, 'jmcruz')
                });
            } else {
                throw new Error('Invalid Message');
            }
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    });

    app.post('/registerack', async (req, res) => {
        try {
            const { sessionID, message, signature } = postData(req, ['sessionID', 'message', 'signature']);

            console.log('\n=============== Received request to register ack.:')
            console.log(`Session ID: ${sessionID}`)
            console.log(`Message: ${JSON.stringify(message)}`)
            console.log(`Signature: ${signature}`)
            console.log()

            await verifyUserSignature(['session_id', sessionID], message, signature)

            console.log('Signature OK.')

            const { session_key, status, nonce } = await getFromUser(['session_key', 'status', 'nonce'], 'session_id', sessionID)
            if(status > 0) throw new Error('Already registed!'); // It was already ack
            if(!session_key) throw new Error('Invalid Session');

            let payload = decryptAES256(message, session_key)
            try{ payload = JSON.parse(payload) } 
            catch{ throw new Error('Invalid Message'); }

            if(payload.nonce <= nonce) throw new Error('Invalid nonce');

            console.log(`Decrypted message: ${payload.message}`)

            if(payload.message === 'REGISTER_ACK'){
                await updateUser({'status': 1, 'nonce': payload.nonce, 'port': payload.port}, {'session_id': sessionID})
                res.sendStatus(200)
            } else {
                throw new Error('Invalid Message');
            }
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    })
}
