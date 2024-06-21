import { generateUsername, generateRandomBytes, postData, runQuery } from "../utils.js"

function savePreregister(params) {
    const sql = `INSERT INTO user (full_name, one_time_id, username, security_level) VALUES (?, ?, ?, ?)`;
    return runQuery(sql, params);
}

export default function preregisterRoutes(app) {
    app.post('/preregister', async (req, res) => {
        try {
            let { securityLevel, fullName } = postData(req, ['securityLevel', 'fullName']);

            console.log('\n=============== Received request to pre-register:')
            console.log(`Full name: ${fullName}`)
            console.log(`Security Level: ${securityLevel}`)
            console.log()

            securityLevel = parseInt(securityLevel);
            if (isNaN(securityLevel) || securityLevel < 1 || securityLevel > 3) {
                throw new Error('Invalid Security Level');
            }

            const username = generateUsername(fullName);
            const oneTimeId = generateRandomBytes(16);

            await savePreregister([fullName, oneTimeId, username, securityLevel])

            console.log('Send register details:')
            console.log(`Username: ${username}`)
            console.log(`OneTimeID: ${oneTimeId}`)
            
            res.status(200).json({ username: username, oneTimeId: oneTimeId }); 
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    });
}
