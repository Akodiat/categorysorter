const initialData = {
  items: {
    'item-1': { id: 'item-1', content: 'Take out the garbage' },
    'item-2': { id: 'item-2', content: 'Watch my favorite show' },
    'item-3': { id: 'item-3', content: 'Charge my phone' },
    'item-4': { id: 'item-4', content: 'Cook dinner' },
  },
  categories: {
    'category-0': {
      id: 'category-0',
      title: 'Ungrouped',
      itemIds: ['item-1', 'item-2', 'item-3', 'item-4'],
    },
  },
  // Facilitate reordering of the categories
  categoryOrder: ['category-0'],
  categoryIdCounter: 0
};

export default initialData;
