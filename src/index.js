import React from 'react';
import ReactDOM from 'react-dom';
import '@atlaskit/css-reset';
import styled from 'styled-components';
import {DragDropContext, Droppable} from 'react-beautiful-dnd';
import initialData from './initial-data';
import Row from './row';
import {saveState, readCSV, readJSON} from './io';


const FileInput = styled.input`
  border: '1px solid #ccc',
  height: 45px,
  lineHeight: 2.5px,
  paddingLeft: 10px,
  background: #8BA6E9
`;

const SaveButton = styled.button`
  background: #7E96C4
`;


const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

class InnerList extends React.PureComponent {
  render() {
    const { row, taskMap, index } = this.props;
    const tasks = row.taskIds.map(taskId => taskMap[taskId]);
    return <Row row={row} tasks={tasks} index={index} />;
  }
}

class App extends React.Component {
  state = initialData;

  saveState = () => {
    saveState(this.state, this.filename);
  }

  onFileUpload = (event) => {
    const file = event.target.files[0];
    const splitName = file.name.split('.');
    this.filename = splitName.slice(0, -1).join('.');
    const [suffix] = splitName.slice(-1);
    if (suffix === 'csv') {
      readCSV(file, newState=>{
        this.setState(newState);
      });

    } else if (suffix === 'json') {
      readJSON(file, newState=>{
        this.setState(newState);
      });
    } else {
      alert(`Unable to read files of type "${suffix}". Please use "csv" or "json" instead.`)
    }
  }

  onDragEnd = (result, provided) => {
    let { destination, source, draggableId, type } = result;

    if (!destination) {

      if (type === 'row') {
        return;
      }
      const newIdCount = this.state.rowIdCounter + 1;
      this.setState({
        ...this.state,
        rowIdCounter: newIdCount
      })
      const newId = `row-${newIdCount}`;
      console.assert(this.state.rows[newId] === undefined, "Row already exists");

      destination = {
        droppableId: newId,
        index: 0
      }

      const newRowOrder = Array.from(this.state.rowOrder);
      newRowOrder.push(newId);

      const newState = {
        ...this.state,
        rowOrder: newRowOrder,
        rows: {
          ...this.state.rows,
          [newId]: {
            id: newId,
            title: 'New group '+newIdCount,
            taskIds: [],
          },
        }
      };

      this.setState(newState);
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (type === 'row') {
      const newRowOrder = Array.from(this.state.rowOrder);
      newRowOrder.splice(source.index, 1);
      newRowOrder.splice(destination.index, 0, draggableId);

      const newState = {
        ...this.state,
        rowOrder: newRowOrder,
      };
      this.setState(newState);
      return;
    }

    const home = this.state.rows[source.droppableId];
    const foreign = this.state.rows[destination.droppableId];

    if (home === foreign) {
      const newTaskIds = Array.from(home.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newHome = {
        ...home,
        taskIds: newTaskIds,
      };

      const newState = {
        ...this.state,
        rows: {
          ...this.state.rows,
          [newHome.id]: newHome,
        },
      };

      this.setState(newState);
      return;
    }

    // moving from one list to another
    const homeTaskIds = Array.from(home.taskIds);
    homeTaskIds.splice(source.index, 1);
    const newHome = {
      ...home,
      taskIds: homeTaskIds,
    };

    const foreignTaskIds = Array.from(foreign.taskIds);
    foreignTaskIds.splice(destination.index, 0, draggableId);
    const newForeign = {
      ...foreign,
      taskIds: foreignTaskIds,
    };

    let newRows = {
      ...this.state.rows,
      [newHome.id]: newHome,
      [newForeign.id]: newForeign,
    }
    const newRowOrder = Array.from(this.state.rowOrder);
    if (homeTaskIds.length === 0) {
      delete newRows[newHome.id];
      newRowOrder.splice(newRowOrder.indexOf(newHome.id), 1);
    }

    const newState = {
      ...this.state,
      rows: newRows,
      rowOrder: newRowOrder
    };
    this.setState(newState);
  };

  render() {
    return (
      <div>
      <FileInput type='file' onChange={this.onFileUpload}/>
      <SaveButton onClick={this.saveState}>Save</SaveButton>
      <DragDropContext
        onDragStart={this.onDragStart}
        onDragUpdate={this.onDragUpdate}
        onDragEnd={this.onDragEnd}
      >
        <Droppable
          droppableId="all-rows"
          direction="vertical"
          type="row"
        >
          {provided => (
            <Container
              {...provided.droppableProps}
              innerRef={provided.innerRef}
            >
              {this.state.rowOrder.map((rowId, index) => {
                const row = this.state.rows[rowId];
                return (
                  <InnerList
                    key={row.id}
                    row={row}
                    taskMap={this.state.tasks}
                    index={index}
                  />
                );
              })}
              {provided.placeholder}
            </Container>
          )}
        </Droppable>
      </DragDropContext>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
