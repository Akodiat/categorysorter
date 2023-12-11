import React from 'react';
import ReactDOM from 'react-dom';
import '@atlaskit/css-reset';
import styled from 'styled-components';
import {DragDropContext, Droppable} from 'react-beautiful-dnd';
import initialData from './initial-data';
import {ActivityTimer} from './ActivityTimer';
import Row from './category';
import {readCSV, readJSON, readXLSX, saveXLSX} from './io';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Jumbotron from 'react-bootstrap/Jumbotron';
import 'bootstrap/dist/css/bootstrap.min.css';


const RowContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

class InnerList extends React.PureComponent {
  render() {
    const {category, itemMap, index, updateTitle, toggleUnique} = this.props;
    const items = category.itemIds.map(itemId => itemMap[itemId]);
    return <Row
      category={category}
      items={items}
      index={index}
      updateTitle={updateTitle}
      toggleUnique={toggleUnique}
    />;
  }
}

class App extends React.Component {
  state = initialData;

  activityTimer = new ActivityTimer(
    5 * 60, // 5 minutes idle time
    10,      // 10 second tick length
    this.state.activeTime,
    newActiveTime => {
      const newState = {
        ...this.state,
        activeTime: Math.round(newActiveTime)
      }
      this.setState(newState);
    }
  );

  saveState = () => {
    saveXLSX(this.state, this.filename);
  }

  onFileUpload = (event) => {
    // Parse file name and type
    const file = event.target.files[0];
    const splitName = file.name.split('.');
    this.filename = splitName.slice(0, -1).join('.');
    const [suffix] = splitName.slice(-1);

    // Make sure to call the correct parser
    let fParse;
    switch (suffix) {
      case 'csv':  fParse = readCSV; break;
      case 'xlsx': fParse = readXLSX; break;
      case 'json': fParse = readJSON; break;

      default:
        alert(`Unable to read files of type "${suffix}". Please use "csv", "xlsx" or "json" instead.`);
        return;
      }
      fParse(file, newState=>{
        this.setState(newState);
        this.activityTimer.reset(newState.activeTime);
    });
  }

  updateTitle = (rowId, newTitle) => {
    const newState = {
      ...this.state,
      categories: {
        ...this.state.categories,
        [rowId]: {
          ...this.state.categories[rowId],
          title: newTitle
        }
      }
    }
    this.setState(newState);
  }

  toggleUnique = (itemId) => {
    const newState = {
      ...this.state,
      items: {
        ...this.state.items,
        [itemId]: {
          ...this.state.items[itemId],
          unique: !this.state.items[itemId].unique
        }
      }
    }
    this.setState(newState);
  }

  onDragEnd = (result, provided) => {
    let { destination, source, draggableId, type } = result;

    if (!destination) {

      if (type === 'category') {
        return;
      }
      const newIdCount = this.state.categoryIdCounter + 1;
      this.setState({
        ...this.state,
        categoryIdCounter: newIdCount
      })
      const newId = `category-${newIdCount}`;
      console.assert(this.state.categories[newId] === undefined, "Row already exists");

      destination = {
        droppableId: newId,
        index: 0
      }

      const newCategoryOrder = Array.from(this.state.categoryOrder);
      newCategoryOrder.push(newId);

      const newState = {
        ...this.state,
        categoryOrder: newCategoryOrder,
        categories: {
          ...this.state.categories,
          [newId]: {
            id: newId,
            title: 'New group '+newIdCount,
            itemIds: [],
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

    if (type === 'category') {
      const newRowOrder = Array.from(this.state.categoryOrder);
      newRowOrder.splice(source.index, 1);
      newRowOrder.splice(destination.index, 0, draggableId);

      const newState = {
        ...this.state,
        categoryOrder: newRowOrder,
      };
      this.setState(newState);
      return;
    }

    const home = this.state.categories[source.droppableId];
    const foreign = this.state.categories[destination.droppableId];

    if (home === foreign) {
      const newItemIds = Array.from(home.itemIds);
      newItemIds.splice(source.index, 1);
      newItemIds.splice(destination.index, 0, draggableId);

      const newHome = {
        ...home,
        itemIds: newItemIds,
      };

      const newState = {
        ...this.state,
        categories: {
          ...this.state.categories,
          [newHome.id]: newHome,
        },
      };

      this.setState(newState);
      return;
    }

    // moving from one list to another
    const homeItemIds = Array.from(home.itemIds);
    homeItemIds.splice(source.index, 1);
    const newHome = {
      ...home,
      itemIds: homeItemIds,
    };

    const foreignItemIds = Array.from(foreign.itemIds);
    foreignItemIds.splice(destination.index, 0, draggableId);
    const newForeign = {
      ...foreign,
      itemIds: foreignItemIds,
    };

    let newRows = {
      ...this.state.categories,
      [newHome.id]: newHome,
      [newForeign.id]: newForeign,
    }
    const newRowOrder = Array.from(this.state.categoryOrder);
    if (homeItemIds.length === 0) {
      delete newRows[newHome.id];
      newRowOrder.splice(newRowOrder.indexOf(newHome.id), 1);
    }

    const newState = {
      ...this.state,
      categories: newRows,
      categoryOrder: newRowOrder
    };
    this.setState(newState);
  };

  render() {
    return (
      <div
        onMouseMove={()=>{this.activityTimer.resetIdleTimer()}}
        onKeyDown={()=>this.activityTimer.resetIdleTimer()}
      >
        <Jumbotron>
          <h1>Category sorter</h1>
          <p>
            Drag and drop items to change their order. <b>Create a new category by dropping an item outside any existing category.</b>
          </p>
          <p>
            Input a csv file with the items to be sorted in the first column. You may also upload a sorted JSON file saved from this app.
          </p>
          <Form.Group controlId="formFileLg" className="mb-3">
            <Form.File size="lg" onChange={this.onFileUpload}/>
          </Form.Group>
          <Button variant="primary" onClick={this.saveState}
            title={`Save the current state as a JSON file (you have spent ${Math.round(this.state.activeTime / 60)} minutes sorting) `}
          >Save current state</Button>
        </Jumbotron>
      <DragDropContext
        onDragStart={this.onDragStart}
        onDragUpdate={this.onDragUpdate}
        onDragEnd={this.onDragEnd}
      >
        <Droppable
          droppableId="all-categories"
          direction="vertical"
          type="category"
        >
          {provided => (
            <RowContainer
              {...provided.droppableProps}
              innerRef={provided.innerRef}
            >
              {this.state.categoryOrder.map((rowId, index) => {
                const category = this.state.categories[rowId];
                return (
                  <InnerList
                    key={category.id}
                    category={category}
                    itemMap={this.state.items}
                    index={index}
                    updateTitle={this.updateTitle}
                    toggleUnique={this.toggleUnique}
                  />
                );
              })}
              {provided.placeholder}
            </RowContainer>
          )}
        </Droppable>
      </DragDropContext>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
