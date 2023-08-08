import Papa from 'papaparse';
import readXlsxFile from 'read-excel-file'

// Function to save text to a file
function saveFile(text, filename, type='text/plain') {
    const file = new Blob([text], {type: type});
    const a = document.createElement("a"),
    url = URL.createObjectURL(file);
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 0);
}

function saveState(state, filename='categorised.json') {
    const data = state.categoryOrder.map(rowId=>{
        const category = state.categories[rowId];
        const items = category.itemIds.map(itemId=>state.items[itemId].content);
        return {
            title: category.title,
            items: items
        }
    });
    saveFile(JSON.stringify(data, undefined, 2), filename, 'application/json')
}

function readJSON(file, callback) {
    const reader = new FileReader();
    reader.onload = e => {
        const data = JSON.parse(e.target.result);

        const newState = {
            items: {},
            categories: {},
            categoryOrder: [],
            categoryIdCounter: 0
        };

        data.forEach((category, iRow)=>{
            const rowId = `category-${iRow}`;
            newState.categories[rowId] = {
                id: rowId,
                title: category.title,
                itemIds: []
            };
            category.items.forEach((item, iItem)=>{
                const id = `item-${iItem}`;
                newState.items[id] = {id: id, content: item};
                newState.categories[rowId].itemIds.push(id);
            });
            newState.categoryOrder.push(rowId);
        });

        callback(newState);
    }
    reader.readAsText(file);
}

function readCSV(file, callback) {
    Papa.parse(file, {
        complete: (results) => {
            const lines = results.data.map(row=>row[0]);
            const newState = stateFromLines(lines);
            console.log(`Loaded ${lines.length} items`);
            callback(newState);
        }
      });
}

function stateFromLines(lines) {
    const items = {};
    const itemIds =  [];
    lines.forEach((item, i) => {
      const id = `item-${i}`;
      items[id] = {id: id, content: item};
      itemIds.push(id);
    });
    const newState = {
      items: items,
      categories: {
        'category-0': {
          id: 'category-0',
          title: 'Ungrouped',
          itemIds: itemIds,
        },
      },
      categoryOrder: ['category-0'],
      categoryIdCounter: 0
    };

    return newState;
}

function readXLSX(file, callback) {
    readXlsxFile(file).then((rows) => {
        const lines = rows.map(row=>row[0]);
        const newState = stateFromLines(lines);
        console.log(`Loaded ${lines.length} items`);
        callback(newState);
      })
}

export {saveFile, saveState, readCSV, readJSON, readXLSX}