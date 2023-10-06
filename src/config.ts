import { config } from 'dotenv';
config();

export const configuration = {
    server: {
        env: process.env.TTV_SERVER_ENV,
        protocol: process.env.TTV_SERVER_PROTOCOL,
        host: process.env.TTV_SERVER_HOST,
        port: process.env.TTV_SERVER_PORT
    },
    dataSource: {
        driver: process.env.TTV_DATA_SOURCE_DRIVER,
        host: process.env.TTV_DATA_SOURCE_HOST,
        port: process.env.TTV_DATA_SOURCE_PORT,
        user: process.env.TTV_DATA_SOURCE_USER,
        password: process.env.TTV_DATA_SOURCE_PASSWORD,
        schema: process.env.TTV_DATA_SOURCE_SCHEMA,
        ssl: {
            caFileName: process.env.TTV_DATA_SOURCE_SSL_CA_FILE_NAME,
            clientCertFileName: process.env.TTV_DATA_SOURCE_SSL_CLIENT_CERT_FILE_NAME,
            clientKeyFileName: process.env.TTV_DATA_SOURCE_SSL_CLIENT_KEY_FILE_NAME
        }
    },
    jwt: {
        secretPassphrase: process.env.TTV_JWT_SECRET_PASSPHRASE,
        secretRefreshPassphrase: process.env.TTV_JWT_REFRESH_SECRET_PASSPHRASE,
        tokenLife: process.env.TTV_JWT_TOKEN_LIFE,
        refreshTokenLife: process.env.TTV_JWT_REFRESH_TOKEN_LIFE
    },
    email: {
        user: process.env.TTV_EMAIL_USER,
        appPassword: process.env.TTV_EMAIL_APP_PASSWORD
    },
    stripe: {
        secretKey: process.env.STRIPE_SECRET_KEY,
        hookSignatureSecret: process.env.STRIPE_HOOK_SIGNATURE_SECRET
    }
};