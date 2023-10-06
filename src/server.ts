import express from 'express';

import { configuration as cf } from "./config";
import { authorizeIncomingRequest } from "./middleware/security";
import router from "./routes/router";

const server = express();

server.use(express.urlencoded({extended: true}));
server.use([authorizeIncomingRequest]);
server.use(router);

server.listen(
    Number(cf.server.port),
    String(cf.server.host),
    () => console.log(`Server up and running in ${String(cf.server.host)}:${String(cf.server.port)}`)
);
