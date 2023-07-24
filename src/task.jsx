import React from 'react';
import styled from 'styled-components';
import { Draggable } from 'react-beautiful-dnd';
import 'react-edit-text/dist/index.css';

const Container = styled.div`
  border: 1px solid lightgrey;
  border-radius: 2px;
  margin: 2px;
  padding: 4px;
  min-width: 10em;
  background-color: ${props => (props.isDragging ? '#F7E4E0' : 'white')};
`;

// Dont animate a transition back to the original row if we drag
// outside the categories (creating a new category)
function getStyle(style, snapshot) {
  if (snapshot.isDropAnimating && snapshot.draggingOver === null) {
    return {
      ...style,
      transform: `translatey(0 px)`,
      transition: `all`,
    };
  }
  return style;
}

export default class Task extends React.Component {
  render() {
    return (
      <Draggable draggableId={this.props.task.id} index={this.props.index}>
        {(provided, snapshot) => (
          <Container
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            innerRef={provided.innerRef}
            isDragging={snapshot.isDragging}
            aria-roledescription="Press space bar to lift the task"
            style={getStyle(provided.draggableProps.style, snapshot)}
          >
          {this.props.task.content}
          </Container>
        )}
      </Draggable>
    );
  }
}
