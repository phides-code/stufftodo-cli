const options: String[] = [
    '(P)ending',
    '(C)ompleted',
    '(A)ll',
    '(N)ew',
    '(M)ark Complete',
    '(E)dit',
    '(D)elete',
    '(Q)uit',
];

const printMainMenu = () => {
    options.forEach((option) => console.log(option));
};

export default printMainMenu;
