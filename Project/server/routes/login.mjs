import crypto from "crypto";
import { decryptRSA, encryptRSA, getFromUser, postData, sign, updateUser, verify_sign } from "../utils.js"
import { PRIVATE_KEY } from "../index.js";

export default function loginRoutes(app) {
    app.post('/login', async (req, res) => {
        try {
            const { username, message, signature } = postData(req, ['username', 'message', 'signature']);

            console.log('\n=============== Received request to login:')
            console.log(`Username: ${username}`)
            console.log(`Message: ${message}`)
            console.log(`Signature: ${signature}`)
            console.log()

            const { public_key, security_level, nonce } = await getFromUser(['public_key', 'security_level', 'nonce'], 'username', username)
            
            const authenticated = verify_sign(message, signature, public_key)
            if(!authenticated) throw new Error('Invalid Signature');

            console.log('Signature OK.')

            let payload = decryptRSA(message, PRIVATE_KEY, 'jmcruz')
            try{ payload = JSON.parse(payload) } 
            catch{ throw new Error('Invalid Message'); }

            if(payload.nonce <= nonce) throw new Error('Invalid nonce');

            console.log(`Decrypted message: ${payload.message}`)

            if(payload.message === 'LOGIN'){
                const sessionKey = crypto.randomBytes(16).toString('hex');
                const sessionID = crypto.randomBytes(16).toString('hex');

                await updateUser({'session_key': sessionKey, 'session_id': sessionID, 'nonce': payload.nonce, 'port': payload.port}, {'username': username})

                console.log('Sending this information encrypted and signed:')
                console.log({ 
                    sessionID: sessionID,
                    sessionKey: sessionKey,
                    securityLevel: security_level
                })

                const message = encryptRSA(JSON.stringify({ 
                    sessionID: sessionID,
                    sessionKey: sessionKey,
                    securityLevel: security_level
                }), public_key)

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
}
