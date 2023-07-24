import Papa from 'papaparse';

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
    const data = state.rowOrder.map(rowId=>{
        const category = state.rows[rowId];
        const tasks = category.taskIds.map(taskId=>state.tasks[taskId].content);
        return {
            title: category.title,
            tasks: tasks
        }
    });
    saveFile(JSON.stringify(data, undefined, 2), filename, 'application/json')
}

function readJSON(file, callback) {
    const reader = new FileReader();
    reader.onload = e => {
        const data = JSON.parse(e.target.result);

        const newState = {
            tasks: {},
            rows: {},
            rowOrder: [],
            rowIdCounter: 0
        };

        data.forEach((row, iRow)=>{
            const rowId = `row-${iRow}`;
            newState.rows[rowId] = {
                id: rowId,
                title: row.title,
                taskIds: []
            };
            row.tasks.forEach((item, iTask)=>{
                const id = `task-${iTask}`;
                newState.tasks[id] = {id: id, content: item};
                newState.rows[rowId].taskIds.push(id);
            });
            newState.rowOrder.push(rowId);
        });

        callback(newState);
    }
    reader.readAsText(file);
}

function readCSV(file, callback) {
    Papa.parse(file, {
        complete: (results) => {
          const items = results.data.map(row=>row[0]);
          const tasks = {};
          const taskIds =  [];
          items.forEach((item, i) => {
            const id = `task-${i}`;
            tasks[id] = {id: id, content: item};
            taskIds.push(id);
          });
          const newState = {
            tasks: tasks,
            rows: {
              'row-0': {
                id: 'row-0',
                title: 'Ungrouped',
                taskIds: taskIds,
              },
            },
            rowOrder: ['row-0'],
            rowIdCounter: 0
          };

          console.log(`Loaded ${items.length} items`);
          callback(newState);
        }
      });
}

export {saveFile, saveState, readCSV, readJSON}