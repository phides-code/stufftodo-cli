import * as fs from 'fs';
import * as path from 'path';

const logFilePath = path.join(__dirname, 'stufftodo-cli.log');

const logToFile = (message: string) => {
    const timestamp = new Date()
        .toLocaleString('en-CA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        })
        .replace(',', ' -');

    const logMessage = `${timestamp} - ${message}\n`;

    fs.appendFile(logFilePath, logMessage, (err) => {
        if (err) {
            console.error('Failed to write to log file:', err);
        }
    });
};

export default logToFile;
