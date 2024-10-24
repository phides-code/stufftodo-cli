import readline from 'readline';
import logToFile from './logToFile';
import { createTask, getAllTasks, Task } from './apiUtils';

const menuLevels: (string[] | Task[])[] = [
    [
        // menuLevel[0] is the main menu
        '(P)ending',
        '(C)ompleted',
        '(A)ll',
        '(N)ew',
        '(M)ark Complete',
        '(E)dit',
        '(D)elete',
        '(Q)uit',
    ],
    [], // menuLevel[1] is a task list
    [], // menuLevel[2] is a list of actions for a task
];

let selectedIndex: number = 0;
let currentMenuLevel: number = 0;
let currentMenu: string[] | Task[] = [];
let statusMessage: string = '';
let ignoreNextKeypress: boolean = false;

export const setStatusMessage = (newMessage: string) => {
    statusMessage = newMessage;
};

export const setIgnoreNextKeypress = (newValue: boolean) => {
    ignoreNextKeypress = newValue;
};

const displayMenu = () => {
    console.clear();

    currentMenu = menuLevels[currentMenuLevel];

    currentMenu.forEach((option, index) => {
        const label: string =
            typeof option === 'string' ? option : option.content;
        if (index === selectedIndex) {
            console.log(`> ${label} <`);
        } else {
            console.log(`  ${label}`);
        }
    });

    console.log(getPromptText());
};

const getPromptText = (): string => {
    let prompt = '';

    if (statusMessage != '') {
        prompt = statusMessage;
    } else {
        prompt = 'Select an option:';
    }

    if (currentMenuLevel > 0) {
        prompt += ' ( press B to go back ): ';
    }

    return prompt;
};

const moveCursorUp = () => {
    selectedIndex =
        (selectedIndex - 1 + currentMenu.length) % currentMenu.length;
};

const moveCursorDown = () => {
    selectedIndex = (selectedIndex + 1) % currentMenu.length;
};

const handleReturn = async () => {
    if (currentMenuLevel === 0) {
        await processMainMenuKey(getMenuKeyLetter(selectedIndex));
    } else {
        // do contextual action
    }
};

const getMenuKeyLetter = (index: number): string => {
    // Get the corresponding letter keypress when hitting enter on a main menu index
    const menuOption = currentMenu[index] as string;
    const match = menuOption.match(/\((\w)\)/);

    return match ? match[1] : '';
};

const getIndexFromLetter = (letter: string): number | null => {
    // Get the corresponding index when typing a letter key on the main menu
    const mainMenu = menuLevels[0] as string[];
    const index = mainMenu.findIndex((option) => {
        const match = option.match(/\((\w)\)/);
        return match ? match[1] === letter : false;
    });

    return index !== -1 ? index : null;
};

const moveSelectorOnKeyPress = (menuKey: string) => {
    const thisLetterIndex = getIndexFromLetter(menuKey) as number;
    selectedIndex = thisLetterIndex > 0 ? thisLetterIndex : 0;
};

const exitProgram = () => {
    console.clear();
    console.log('Exiting...');
    logToFile('Exiting...');
    process.exit(0);
};

const backToPriorMenu = () => {
    if (currentMenuLevel > 0) {
        statusMessage = '';
        currentMenuLevel--;
        selectedIndex = 0;
    }

    displayMenu();
};

const populateTaskMenu = (tasks: Task[]) => {
    if (tasks.length > 0) {
        menuLevels[1] = tasks;
    } else {
        menuLevels[1] = [
            {
                _id: '',
                completedOn: 0,
                content: 'No tasks found',
                taskStatus: '',
            } as Task,
        ];
    }
    selectedIndex = 0;
    currentMenuLevel = 1;
    displayMenu();
};

const processMainMenuKey = async (menuKey: string) => {
    switch (menuKey) {
        case 'P':
            break;
        case 'C':
            break;
        case 'A':
            populateTaskMenu(await getAllTasks());
            break;
        case 'N':
            await createTask(readlineInterface);
            break;
        case 'M':
            break;
        case 'E':
            break;
        case 'D':
            break;
        case 'Q':
            exitProgram();
        default:
            break;
    }
};

const main = () => {
    // Initial menu display
    currentMenuLevel = 0;
    displayMenu();

    // Listen for keypress events
    process.stdin.on('keypress', async (str, key) => {
        const keyName = key.name.toUpperCase();

        if (!ignoreNextKeypress) {
            switch (true) {
                case keyName === 'UP':
                    moveCursorUp();
                    break;
                case keyName === 'DOWN':
                    moveCursorDown();
                    break;
                case keyName === 'RETURN':
                    await handleReturn();
                    break;
                case keyName === 'B':
                    backToPriorMenu();
                    break;
                case key.ctrl && keyName === 'C':
                    exitProgram();
                    break;
                case currentMenuLevel === 0:
                    moveSelectorOnKeyPress(keyName);
                    await processMainMenuKey(keyName);
                default:
                    break;
            }
        }

        displayMenu();
    });
};

// Initialize readline interface
const readlineInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
});

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

main();
