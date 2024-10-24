import readline from 'readline';
import logToFile from './logToFile';
import getSecrets from './getSecrets';
import { setIgnoreNextKeypress, setStatusMessage } from '.';

const basePath = 'tasks';

export interface Task {
    _id: string;
    content: string;
    taskStatus: string;
    completedOn: number;
}

interface ApiResponse {
    data: Task[] | null;
    errorMessage: string | null;
}

type ApiPayload = Partial<Task>;

export const getAllTasks = async (): Promise<Task[]> => {
    setStatusMessage('Loading...');
    const apiResponse = await executeApiCall('', '', 'GET', null);
    setStatusMessage('');

    if (apiResponse.data && apiResponse.data?.length > 0) {
        return apiResponse.data as Task[];
    }

    setStatusMessage('something went wrong');
    logToFile('failed to get apiResponse.data');

    if (apiResponse.errorMessage && apiResponse.errorMessage != null) {
        logToFile(
            'getTasks got apiQueryResponse.error: ' + apiResponse.errorMessage
        );
    }

    return [];
};

export const createTask = async (
    readlineInterface: readline.Interface
): Promise<string> => {
    const promptForNewTask = (): Promise<string> =>
        new Promise((resolve) => {
            // Disable raw mode temporarily so readline.question() works properly
            process.stdin.setRawMode(false);

            console.clear();

            readlineInterface.question(
                'Please enter a line of text: ',
                (answer) => {
                    resolve(answer);
                }
            );
        });

    // Set flag to ignore the next keypress event after task creation
    setIgnoreNextKeypress(true);
    const newTaskContent = await promptForNewTask();

    // Re-enable raw mode and keypress handling after task creation
    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);

    logToFile('newTaskContent: ' + newTaskContent);
    // next step: post new task to api

    // ignore keypresses for a brief moment for any stray keypresses in the buffer
    setTimeout(() => {
        setIgnoreNextKeypress(false);
    }, 500);

    return newTaskContent;
};

const executeApiCall = async (
    endpoint: string,
    param: string,
    method: string,
    payload: ApiPayload | null
): Promise<ApiResponse> => {
    try {
        const { apiKey, baseUrl } = await getSecrets();

        const url =
            baseUrl +
            '/' +
            basePath +
            '/' +
            endpoint +
            '/' +
            (param ? param : '');

        const fetchResponse = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': apiKey,
            },
            body: payload ? JSON.stringify(payload) : null,
        });

        return await fetchResponse.json();
    } catch (e) {
        return {
            data: null,
            errorMessage: e as string,
        };
    }
};
