const initialData = {
  tasks: {
    'task-1': { id: 'task-1', content: 'Take out the garbage' },
    'task-2': { id: 'task-2', content: 'Watch my favorite show' },
    'task-3': { id: 'task-3', content: 'Charge my phone' },
    'task-4': { id: 'task-4', content: 'Cook dinner' },
  },
  rows: {
    'row-0': {
      id: 'row-0',
      title: 'Ungrouped',
      taskIds: ['task-1', 'task-2', 'task-3', 'task-4'],
    },
  },
  // Facilitate reordering of the rows
  rowOrder: ['row-0'],
  rowIdCounter: 0
};

export default initialData;