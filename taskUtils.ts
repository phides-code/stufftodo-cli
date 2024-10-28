export interface Task {
    id: string;
    content: string;
    taskStatus: string;
    completedOn: number;
    createdOn: number;
}

interface MenuOptions {
    name: string;
    value: Task;
    description: string;
    disabled: boolean;
}

export const getMenuChoices = (tasks: Task[]): MenuOptions[] => {
    const menuOptions = tasks.map((task) => {
        const completed: boolean = task.taskStatus === 'COMPLETED';

        return {
            name: task.content,
            value: task,
            description: completed
                ? `Completed on ${new Date(task.completedOn).toLocaleString()}`
                : `Created on ${new Date(task.createdOn).toLocaleString()}`,
            disabled: completed,
        };
    });

    return menuOptions.length > 0
        ? menuOptions
        : ([
              {
                  name: 'No tasks found',
                  value: {
                      id: '0',
                      completedOn: 0,
                      createdOn: 0,
                      taskStatus: '',
                  },
                  description: '',
                  disabled: true,
              },
          ] as MenuOptions[]);
};

export const sortTasks = (tasks: Task[]): Task[] => {
    return tasks.sort((a, b) => {
        // Sort by taskStatus: PENDING before COMPLETED
        if (a.taskStatus === 'PENDING' && b.taskStatus !== 'PENDING') return -1;
        if (a.taskStatus !== 'PENDING' && b.taskStatus === 'PENDING') return 1;

        // Within PENDING tasks, sort by createdOn (descending)
        if (a.taskStatus === 'PENDING' && b.taskStatus === 'PENDING') {
            return b.createdOn - a.createdOn;
        }

        // Within COMPLETED tasks, sort by completedOn (descending)
        if (a.taskStatus === 'COMPLETED' && b.taskStatus === 'COMPLETED') {
            return b.completedOn - a.completedOn;
        }

        return 0; // If statuses and dates are equal
    });
};
