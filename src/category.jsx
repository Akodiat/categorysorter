import React from 'react';
import styled from 'styled-components';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { EditText } from 'react-edit-text';
import Item from './item';

const Container = styled.div`
  margin: 8px;
  border: 1px solid lightgrey;
  background-color: white;
  border-radius: 2px;

  display: grid;
`;
const Title = styled.h3`
  padding: 8px;
`;
const ItemList = styled.div`
  padding: 8px;
  transition: background-color 0.2s ease;
  background-color: ${props =>
    props.isDraggingOver ? '#BED0F4' : 'inherit'};
  display: flex;
  flex-grow: 1;
  overflow: auto;
`;

class InnerList extends React.Component {
  toggleUnique = (id) => {
    this.props.toggleUnique(id);
  }

  updateContent = (id, value) => {
    this.props.updateContent(id, value);
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.items === this.props.items) {
      return false;
    }
    return true;
  }
  render() {
    return this.props.items.map((item, index) => (
      <Item
        key={item.id}
        item={item}
        index={index}
        toggleUnique={id=>this.toggleUnique(id)}
        updateContent={this.updateContent}/>
    ));
  }
}

export default class Row extends React.Component {
  toggleUnique = (id) => {
    this.props.toggleUnique(id);
  }

  updateContent = (id, value) => {
    this.props.updateContent(id, value);
  }

  updateTitle = (e, props) => {
    props.updateTitle(props.category.id, e.value);
  }

  render() {
    return (
      <Draggable draggableId={this.props.category.id} index={this.props.index}>
        {provided => (
          <Container {...provided.draggableProps} innerRef={provided.innerRef}>
            <Title {...provided.dragHandleProps}>
              <EditText
                defaultValue={this.props.category.title}
                onSave={e=>this.updateTitle(e, this.props)}
              />
            </Title>
            <Droppable
              droppableId={this.props.category.id}
              type="item"
              direction="horizontal"
            >
              {(provided, snapshot) => (
                <ItemList
                  innerRef={provided.innerRef}
                  {...provided.droppableProps}
                  isDraggingOver={snapshot.isDraggingOver}
                >
                <InnerList
                  items={this.props.items}
                  updateContent={this.updateContent}
                  toggleUnique={id=>this.toggleUnique(id)}/>
                  {provided.placeholder}
                </ItemList>
              )}
            </Droppable>
          </Container>
        )}
      </Draggable>
    );
  }
}
