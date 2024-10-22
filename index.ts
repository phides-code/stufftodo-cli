import readline from 'readline';

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
    ['task 1', 'task 2', 'task 3', 'task 4'],
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
            (currentMenuLevel > 0 ? ' (B to go back)' : '') +
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

const processMainMenuKey = (menuKey: string) => {
    switch (menuKey.toUpperCase()) {
        case 'P':
            break;
        case 'C':
            break;
        case 'A':
            // await fetch all tasks
            // set selectedIndex to 0
            currentMenuLevel = 1;
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
    process.exit(0);
};

const backToPriorMenu = () => {
    if (currentMenuLevel > 0) {
        currentMenuLevel--;
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
        switch (true) {
            case key.name === 'up':
                moveCursorUp();
                break;
            case key.name === 'down':
                moveCursorDown();
                break;
            case key.name === 'return':
                handleReturn();
                break;
            case key.name === 'b':
                backToPriorMenu();
                break;
            case key.ctrl && key.name === 'c':
                exitProgram();
                break;
            case currentMenuLevel === 0:
                processMainMenuKey(key.name);
            default:
                break;
        }

        displayMenu();
    });
};

main();
