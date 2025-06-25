import chromeWebstoreUpload from 'chrome-webstore-upload';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const store = chromeWebstoreUpload({
    extensionId: process.env.EXTENSION_ID,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
});

const token = await store.fetchToken();

const myZipFile = fs.createReadStream('dist/dist.zip');
await store.uploadExisting(myZipFile, token);
await store.publish('default', token);
console.log('Extension published successfully!');
