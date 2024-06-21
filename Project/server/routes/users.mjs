import crypto from "crypto";
import { decryptAES256, encryptAES256, getFromUser, getUser, postData, runQuery, sign, updateUser, verifyUserSignature } from "../utils.js"
import { PRIVATE_KEY } from "../index.js";

export default function usersRoutes(app) {
    app.post('/users', async (req, res) => {
        try {
            const { sessionID, message, signature } = postData(req, ['sessionID', 'message', 'signature']);

            await verifyUserSignature(['session_id', sessionID], message, signature)

            const { session_key, nonce, port } = await getFromUser(['session_key', 'nonce', 'port'], 'session_id', sessionID)
            if(!session_key) throw new Error('Invalid Session');

            let payload = decryptAES256(message, session_key)
            try{ payload = JSON.parse(payload) } 
            catch{ throw new Error('Invalid Message'); }

            if(payload.nonce <= nonce) throw new Error('Invalid nonce');

            if(payload.message === 'USERS'){                
                const users = await runQuery('SELECT username FROM user', [])

                await updateUser({'nonce': payload.nonce}, {'session_id': sessionID})

                const message = encryptAES256(JSON.stringify({ 
                    sessionID: sessionID,
                    users: users
                }), session_key)

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
