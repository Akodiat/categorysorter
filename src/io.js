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
    const categories = state.categoryOrder.map(rowId=>{
        const category = state.categories[rowId];
        const items = category.itemIds.map(itemId=>state.items[itemId].content);
        return {
            title: category.title,
            items: items
        }
    });
    const data = {
        categories: categories,
        activeTime: state.activeTime
    }
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
            categoryIdCounter: 0,
            activeTime: data.activeTime
        };

        data.categories.forEach((category, iRow)=>{
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

function saveCSV(state, filename="output.csv") {
    let lines = ["cluster_label;idea;unique_idea"];
    state.categoryOrder.forEach(label=>{
        const category = state.categories[label];
        category.itemIds.forEach(i=>{
            const item = state.items[i]
            lines.push([
                label,
                item.content,
                item.unique ? item.content : ""
            ].join(";"))
        })
    })
    saveFile(lines.join("\n"), filename, "text/csv")
}

function readCSV(file, callback) {
    Papa.parse(file, {
        complete: (results) => {
            const newState = stateFromLines(results.data);
            callback(newState);
        },
        delimiter: ";",
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true
      });
}

function stateFromLines(rows) {
    let categories = {};
    let categoryOrder = [];
    let items = {};
    rows.forEach((row, i)=>{
        const id = `item-${i}`;
        const label = ""+row.cluster_label;
        items[id] = {
            id: id,
            content: row.idea,
            unique: row.unique_idea !== null
        };
        if (categories[label] === undefined) {
            categoryOrder.push(row.cluster_label);
            categories[label] = {
                id: label,
                title: label,
                itemIds: [],
            };
        }
        categories[row.cluster_label].itemIds.push(id)
    })
    const newState = {
        items: items,
        categories: categories,
        categoryOrder: categoryOrder.map(c=>""+c),//.sort((a,b)=>a-b),
        categoryIdCounter: Math.max(...categoryOrder),
        activeTime: 0
      };
    return newState;
}


function readXLSX(file, callback) {
    readXlsxFile(file).then((rows) => {
        let header;
        let items = [];
        rows.forEach((row, i)=> {
            if (i === 0) {
                header = row
            } else {
                const r = {}
                row.forEach((v,j)=>{
                    r[header[j]] = v
                })
                items.push(r)
            }
        }
        );
        const newState = stateFromLines(items);
        console.log(`Loaded ${items.length} items`);
        callback(newState);
      })
}

export {saveFile, saveState, readCSV, saveCSV, readJSON, readXLSX}