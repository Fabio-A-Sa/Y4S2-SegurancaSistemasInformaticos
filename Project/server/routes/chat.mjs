import { PRIVATE_KEY } from "../index.js";
import { decryptAES256, encryptAES256, getFromUser, postData, sign, updateUser, verifyUserSignature } from "../utils.js"

export default function chatRoutes(app) {
    app.post('/chat', async (req, res) => {
        try {
            const { sessionID, message, signature } = postData(req, ['sessionID', 'message', 'signature']);

            console.log('\n=============== Received request to get user information:')
            console.log(`SessionID: ${sessionID}`)
            console.log(`Message: ${message}`)
            console.log(`Signature: ${signature}`)
            console.log()

            await verifyUserSignature(['session_id', sessionID], message, signature)

            console.log('Signature OK.')

            const { session_key, nonce } = await getFromUser(['session_key', 'nonce'], 'session_id', sessionID)
            if(!session_key) throw new Error('Invalid Session');

            let payload = decryptAES256(message, session_key)
            
            try{ payload = JSON.parse(payload) } 
            catch{ throw new Error('Invalid Message'); }

            if(payload.nonce <= nonce) throw new Error('Invalid nonce');

            console.log(`Decrypted message: ${payload.message}`)

            if(payload.message.op === 'CHAT'){
                let otherUser = payload.message.username
                const {username, port, public_key} = await getFromUser(['username', 'port', 'public_key'], 'username', otherUser)

                await updateUser({'nonce': payload.nonce}, {'session_id': sessionID})

                console.log('Sending this information encrypted and signed:')
                console.log({ 
                    username: username,
                    port: port,
                    public_key: public_key
                })

                const message = encryptAES256(JSON.stringify({ 
                    username: username,
                    port: port,
                    public_key: public_key
                }), session_key)

                res.status(200).json({
                    message: message,
                    signature: sign(JSON.stringify(message), PRIVATE_KEY, 'jmcruz')
                });
            } else {
                throw new Error('Invalid Message');
            }
        } catch (err) {
            console.log(err);
            res.status(400).json({ error: err.message });
        }
            
    });
}
