export interface Task {
    _id: string;
    content: string;
    taskStatus: string;
    completedOn: number;
    createdOn: number;
}

interface MenuOptions {
    name: string;
    value: Task;
    description: string;
}

export const getMenuChoices = (tasks: Task[]): MenuOptions[] => {
    const menuOptions = tasks.map((task) => ({
        name: task.content,
        value: task,
        description: `Created on ${new Date(task.createdOn).toLocaleString()}`,
    }));

    return menuOptions.length > 0
        ? menuOptions
        : ([
              {
                  name: 'No tasks found',
                  value: {
                      _id: '0',
                      completedOn: 0,
                      createdOn: 0,
                      taskStatus: '',
                  },
                  description: '',
              },
          ] as MenuOptions[]);
};
