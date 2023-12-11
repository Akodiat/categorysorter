const initialData = {
  items: {
    'item-1': { id: 'item-1', content: 'Commodi eveniet molestiae sapiente officiis molestiae.' },
    'item-2': { id: 'item-2', content: 'Exercitationem id qui sint vel sed aliquam et ut.' },
    'item-3': { id: 'item-3', content: 'Omnis qui non et doloribus natus.' },
    'item-4': { id: 'item-4', content: 'Et odit eos non sed omnis non' },
    'item-5': { id: 'item-5', content: 'Eaque laudantium fugit impedit non' },
    'item-6': { id: 'item-6', content: 'Magni nulla autem sit provident aut.' },
  },
  categories: {
    'category-0': {
      id: 'category-0',
      title: 'Ungrouped',
      itemIds: ['item-1', 'item-2', 'item-3', 'item-4'],
    },
    'category-1': {
      id: 'category-1',
      title: 'Lorem Ipsum',
      itemIds: ['item-5', 'item-6'],
    },
  },
  // Facilitate reordering of the categories
  categoryOrder: ['category-0', 'category-1'],
  categoryIdCounter: 1,
  activeTime: 0
};

export default initialData;
