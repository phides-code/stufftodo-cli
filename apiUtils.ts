import { ERROR_MESSAGE, setErrorMessage, setStatusMessage } from '.';
import getSecrets from './getSecrets';
import logToFile from './logToFile';
import { sortTasks, Task } from './taskUtils';

const basePath = 'tasks';

interface ApiResponse {
    data: Task[] | Task | null;
    errorMessage: string | null;
}

type ApiPayload = Partial<Task>;

export const getAllTasks = async (): Promise<Task[]> => {
    const apiResponse = await executeApiCall('', '', 'GET', null);

    if (apiResponse.data && (apiResponse.data as Task[]).length >= 0) {
        return sortTasks(apiResponse.data as Task[]);
    }

    setErrorMessage(ERROR_MESSAGE);
    logToFile('getAllTasks() failed to get apiResponse.data');

    if (apiResponse.errorMessage && apiResponse.errorMessage != null) {
        logToFile(
            'getAllTasks() got apiResponse.errorMessage: ' +
                apiResponse.errorMessage
        );
    }

    return [];
};

export const createTask = async (newTaskContent: string) => {
    const apiResponse = await executeApiCall('', '', 'POST', {
        content: newTaskContent,
    });

    if (apiResponse.data && (apiResponse.data as Task).createdOn) {
        setStatusMessage('Task created.');
        return;
    }

    setStatusMessage('Could not create task.');
    logToFile('createTask() failed to get apiResponse.data');

    if (apiResponse.errorMessage && apiResponse.errorMessage != null) {
        logToFile(
            'createTask() got apiResponse.errorMessage: ' +
                apiResponse.errorMessage
        );
    }

    return;
};

export const deleteTask = async (taskId: string) => {
    const apiResponse = await executeApiCall('', taskId, 'DELETE', null);

    if (apiResponse.data && (apiResponse.data as Task).id) {
        setStatusMessage('Task deleted.');
        return;
    }

    setStatusMessage('Could not delete task.');
    logToFile('deleteTask() failed to get apiResponse.data');

    if (apiResponse.errorMessage && apiResponse.errorMessage != null) {
        logToFile(
            'deleteTask() got apiResponse.errorMessage: ' +
                apiResponse.errorMessage
        );
    }

    return;
};

export const updateTask = async (updatedTask: Task) => {
    const apiResponse = await executeApiCall(
        '',
        updatedTask.id,
        'PUT',
        updatedTask
    );

    if (apiResponse.data && (apiResponse.data as Task).id) {
        setStatusMessage('Task updated.');
        return;
    }

    setStatusMessage('Could not update task.');
    logToFile('updateTask() failed to get apiResponse.data');

    if (apiResponse.errorMessage && apiResponse.errorMessage != null) {
        logToFile(
            'updateTask() got apiResponse.errorMessage: ' +
                apiResponse.errorMessage
        );
    }

    return;
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
