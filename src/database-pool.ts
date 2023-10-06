import fs from 'fs';
import { configuration as cf } from "./config";
import knex from "knex";
import { join as pJoin } from "path";

export const connectionPool = knex({
    client: String(cf.dataSource.driver),
    connection: {
        host: String(cf.dataSource.host),
        port: Number(cf.dataSource.port),
        user: String(cf.dataSource.user),
        password: String(cf.dataSource.password),
        database: String(cf.dataSource.schema),
        ssl: {
            ca: fs.readFileSync(pJoin(__dirname, '..', 'certs', String(cf.dataSource.ssl.caFileName))),
            cert: fs.readFileSync(pJoin(__dirname, '..', 'certs', String(cf.dataSource.ssl.clientCertFileName))),
            key: fs.readFileSync(pJoin(__dirname, '..', 'certs', String(cf.dataSource.ssl.clientKeyFileName)))
        },
        typeCast: (field: { type: string; length: number; buffer: () => any; }, next: () => any) => {
            if ((field.type === "BIT") && (field.length === 1)) {
                let bytes = field.buffer();
                if (bytes)
                    return (bytes[0] === 1);
                else return 0;
            }

            return next();
        }
    }
});
