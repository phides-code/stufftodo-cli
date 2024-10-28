import { input } from '@inquirer/prompts';
import select from './inquirerSelect';
import { getMenuChoices, Task } from './taskUtils';
import { createTask, deleteTask, getAllTasks, updateTask } from './apiUtils';

let actionLetter: string = '';
let errorMessage: string = '';
let statusMessage: string = '';
let weHaveAtLeastOneTask: boolean = false;
let errorState: boolean = false;

export const getWeHaveAtLeastOneTask = (): boolean => weHaveAtLeastOneTask;
export const getErrorState = (): boolean => errorState;
export const setActionLetter = (newAction: string) => {
    actionLetter = newAction;
};
export const setErrorMessage = (newMessage: string) => {
    errorMessage = newMessage;
};
export const setStatusMessage = (newMessage: string) => {
    statusMessage = newMessage;
};

export const ERROR_MESSAGE = 'Something went wrong';

const showMainMenu = async () => {
    const buildMenuPrompt = (): string => {
        let menuPrompt = '';

        if (!errorState) {
            if (weHaveAtLeastOneTask) {
                menuPrompt = 'Select a task\n(M)ark done, (E)dit, (D)elete, ';
            }

            menuPrompt += '(C)reate, ';
        }

        return menuPrompt + '(Q)uit';
    };

    const tasks = await getAllTasks();

    weHaveAtLeastOneTask = tasks.length > 0 && tasks[0].id !== '0';
    errorState = errorMessage !== '';

    const menuChoices = getMenuChoices(tasks);

    console.log(errorMessage);
    console.log(statusMessage);

    const selectedTask = await select({
        message: buildMenuPrompt(),
        choices: menuChoices,
    });

    switch (actionLetter) {
        case 'Q':
            process.exit(0);
        case 'C':
            await processCreateTask();
            break;
        case 'M':
            await processMarkDone(selectedTask);
            break;
        case 'E':
            await processEdit(selectedTask);
            break;
        case 'D':
            await processDelete(selectedTask.id);
        default:
            break;
    }

    showMainMenu();
};

const processMarkDone = async (task: Task) => {
    console.log('Marking task ' + task.id + ' as done...');

    await updateTask({
        ...task,
        taskStatus: 'COMPLETED',
        completedOn: Date.now(),
    });
};

const processEdit = async (task: Task) => {
    const newTaskContent = await input({
        default: task.content,
        message: 'Editing task (press (Tab) to fill): ',
    });

    console.log('Updating task: ' + task.id + '...');

    await updateTask({
        ...task,
        content: newTaskContent,
    });
};

const processDelete = async (taskId: string) => {
    console.log('Deleting task: ' + taskId + '...');
    await deleteTask(taskId);
};

const processCreateTask = async () => {
    const newTaskContent = await input({ message: 'Enter new task: ' });
    console.log('Creating new task...');
    await createTask(newTaskContent);
};

// Handle '\x03' aka ctrl-c
process.stdin.on('data', (key) => {
    if (key.toString() === '\x03') {
        process.exit(0);
    }
    // Ignore all other keypresses
});

showMainMenu();
