import express from "express";
import bodyParser from "body-parser";
import fs from "fs";

// Routes
import preregisterRoutes from "./routes/preregister.mjs"
import registerRoutes from "./routes/register.mjs"
import loginRoutes from "./routes/login.mjs"
import servicesRoutes from "./routes/services.mjs"
import usersRoutes from "./routes/users.mjs";
import chatRoutes from "./routes/chat.mjs";

const PORT = 3000;

export const app = express();
app.use(bodyParser.json());

export const PRIVATE_KEY = fs.readFileSync('keys/private.pem', 'utf8');
export const PUBLIC_KEY = fs.readFileSync('keys/public.pem', 'utf8');

preregisterRoutes(app)
registerRoutes(app)
loginRoutes(app)
usersRoutes(app)
servicesRoutes(app)
chatRoutes(app)

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
