import logToFile from './logToFile';
import getSecrets from './getSecrets';

const basePath = 'tasks';

interface Task {
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

const queryApi = async (
    endpoint: string,
    param: string,
    method: string,
    payload: ApiPayload | null
): Promise<Task[]> => {
    const apiResponse = await executeApiCall(endpoint, param, method, payload);

    if (apiResponse.data && apiResponse.data?.length > 0) {
        return apiResponse.data as Task[];
    }

    console.log('something went wrong - press any key');
    logToFile('something went wrong');

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

        return await fetchResponse.json();
    } catch (e) {
        return {
            data: null,
            errorMessage: e as string,
        };
    }
};

export default queryApi;
