import { ERROR_MESSAGE, setErrorMessage } from '.';
import getSecrets from './getSecrets';
import logToFile from './logToFile';
import { Task } from './tasks';

const basePath = 'tasks';

interface ApiResponse {
    data: Task[] | null;
    errorMessage: string | null;
}

type ApiPayload = Partial<Task>;

export const getAllTasks = async (): Promise<Task[]> => {
    // setStatusMessage('Loading...');
    const apiResponse = await executeApiCall('', '', 'GET', null);
    // setStatusMessage('');

    if (apiResponse.data && apiResponse.data?.length > 0) {
        return apiResponse.data as Task[];
    }

    setErrorMessage(ERROR_MESSAGE);
    logToFile('failed to get apiResponse.data');

    if (apiResponse.errorMessage && apiResponse.errorMessage != null) {
        logToFile(
            'getTasks got apiQueryResponse.error: ' + apiResponse.errorMessage
        );
    }

    return [];
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

        return (await fetchResponse.json()) as ApiResponse;
    } catch (e) {
        return {
            data: null,
            errorMessage: e as string,
        };
    }
};
