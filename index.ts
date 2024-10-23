import readline from 'readline';
import logToFile from './logToFile';
import queryApi from './queryApi';

const menuLevels: string[][] = [
    [
        '(P)ending',
        '(C)ompleted',
        '(A)ll',
        '(N)ew',
        '(M)ark Complete',
        '(E)dit',
        '(D)elete',
        '(Q)uit',
    ],
    [],
];

let selectedIndex: number = 0;
let currentMenuLevel = 0;
let currentMenu: string[] = [];

const displayMenu = () => {
    console.clear();

    currentMenu = menuLevels[currentMenuLevel];

    currentMenu.forEach((option, index) => {
        if (index === selectedIndex) {
            console.log(`> ${option} <`);
        } else {
            console.log(`  ${option}`);
        }
    });

    console.log(
        '\nSelect an option' +
            (currentMenuLevel > 0 ? ' ((B) to go back)' : '') +
            ': '
    );
};

const moveCursorUp = () => {
    selectedIndex =
        (selectedIndex - 1 + currentMenu.length) % currentMenu.length;
};

const moveCursorDown = () => {
    selectedIndex = (selectedIndex + 1) % currentMenu.length;
};

const handleReturn = () => {
    if (currentMenuLevel === 0) {
        processMainMenuKey(getMenuKeyLetter(selectedIndex));
    } else {
        // do contextual action
    }
};

const getMenuKeyLetter = (index: number): string => {
    // Get the corresponding letter keypress when hitting enter on a main menu index
    const menuOption = currentMenu[index];
    const match = menuOption.match(/\((\w)\)/);

    return match ? match[1] : '';
};

function getIndexFromLetter(letter: string): number | null {
    // Get the corresponding index when typing a letter key on the main menu
    const index = menuLevels[0].findIndex((option) => {
        const match = option.match(/\((\w)\)/);
        return match ? match[1] === letter : false;
    });

    return index !== -1 ? index : null;
}

const getAllTasks = async () => {
    const tasks = await queryApi('', '', 'GET', null);

    if (tasks.length > 0) {
        menuLevels[1] = tasks.map((task) => task.content);
    } else menuLevels[1].push('No tasks found');

    selectedIndex = 0;
    currentMenuLevel = 1;
    displayMenu();
};

const moveSelectorOnKeyPress = (menuKey: string) => {
    const thisIndex = getIndexFromLetter(menuKey) as number;
    selectedIndex = thisIndex > 0 ? thisIndex : 0;
};

const processMainMenuKey = async (menuKey: string) => {
    switch (menuKey) {
        case 'P':
            break;
        case 'C':
            break;
        case 'A':
            getAllTasks();
            break;
        case 'N':
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

const exitProgram = () => {
    console.clear();
    console.log('Exiting...');
    logToFile('Exiting...');
    process.exit(0);
};

const backToPriorMenu = () => {
    if (currentMenuLevel > 0) {
        currentMenuLevel--;
        selectedIndex = 0;
    }

    displayMenu();
};

const main = () => {
    // Initialize readline interface
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: true,
    });

    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);

    // Initial menu display
    currentMenuLevel = 0;
    displayMenu();

    // Listen for keypress events
    process.stdin.on('keypress', (str, key) => {
        const keyName = key.name.toUpperCase();

        switch (true) {
            case keyName === 'UP':
                moveCursorUp();
                break;
            case keyName === 'DOWN':
                moveCursorDown();
                break;
            case keyName === 'RETURN':
                handleReturn();
                break;
            case keyName === 'B':
                backToPriorMenu();
                break;
            case key.ctrl && keyName === 'C':
                exitProgram();
                break;
            case currentMenuLevel === 0:
                moveSelectorOnKeyPress(keyName);
                processMainMenuKey(keyName);
            default:
                break;
        }

        displayMenu();
    });
};

main();
