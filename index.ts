import { input } from '@inquirer/prompts';
import select, { addAllowedMenuOptions } from './inquirerSelect';
import { getMenuChoices, Task } from './tasks';
import { getAllTasks } from './apiUtils';

let actionLetter: string = '';
let errorMessage: string = '';
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

export const ERROR_MESSAGE = 'Something went wrong';

const showMainMenu = async () => {
    const buildMenuPrompt = (): string => {
        let menuPrompt = '';

        if (!errorState) {
            if (weHaveAtLeastOneTask) {
                menuPrompt = 'Select a task\n(M)ark done, (E)dit, (D)elete, ';
                addAllowedMenuOptions('MED');
            }

            menuPrompt += '(C)reate, ';
            addAllowedMenuOptions('C');
        }

        return menuPrompt + '(Q)uit';
    };

    const tasks = await getAllTasks();

    weHaveAtLeastOneTask = !(tasks.length === 1 && tasks[0]._id === '0');
    errorState = errorMessage !== '';

    const menuChoices = getMenuChoices(tasks);

    console.log(errorMessage);

    const selectedTask = await select({
        message: buildMenuPrompt(),
        choices: menuChoices,
    });

    if (actionLetter === 'Q') {
        process.exit(0);
    }

    if (!errorState) {
        if (actionLetter === 'C') {
            await processCreateTask();
        } else if (weHaveAtLeastOneTask) {
            switch (actionLetter) {
                case 'M':
                    processMarkDone(selectedTask._id);
                    break;
                case 'E':
                    await processEdit(selectedTask);
                    break;
                case 'D':
                    processDelete(selectedTask._id);
                    break;

                default:
                    break;
            }
        }
    }

    showMainMenu();
};

const processMarkDone = (taskId: string) => {
    if (taskId !== '0') {
        console.log('Marking taskId ' + taskId + ' as done.');
    }
};

const processEdit = async (task: Task) => {
    if (task._id !== '0') {
        const newTask = await input({
            default: task.content,
            message: 'Editing task (press (Tab) to fill): ',
        });

        console.log('Got newTask: ' + newTask);
    }
};

const processDelete = (taskId: string) => {
    if (taskId !== '0') {
        console.log('Deleting taskId ' + taskId);
    }
};

const processCreateTask = async () => {
    const newTask = await input({ message: 'Enter new task: ' });
    console.log('Creating newTask: ' + newTask);
};

// Handle '\x03' aka ctrl-c
process.stdin.on('data', (key) => {
    if (key.toString() === '\x03') {
        process.exit(0);
    }
    // Ignore all other keypresses
});

showMainMenu();
