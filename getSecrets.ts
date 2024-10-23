import * as fs from 'fs';
import * as path from 'path';

// Define the path to your secrets file
const secretFilePath = path.join(__dirname, 'secrets.json');

// Asynchronous function to read and parse the secrets from a file
const getSecrets = async (): Promise<{
    apiKey: string;
    baseUrl: string;
}> => {
    return new Promise((resolve, reject) => {
        fs.readFile(secretFilePath, 'utf8', (err, data) => {
            if (err) {
                reject('Error reading the secrets file: ' + err);
            } else {
                try {
                    const secrets = JSON.parse(data);
                    resolve(secrets);
                } catch (parseErr) {
                    reject('Error parsing the secrets file: ' + parseErr);
                }
            }
        });
    });
};

export default getSecrets;
