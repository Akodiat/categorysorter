import React from 'react';
import styled from 'styled-components';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { EditText } from 'react-edit-text';
import Task from './task';

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
const TaskList = styled.div`
  padding: 8px;
  transition: background-color 0.2s ease;
  background-color: ${props =>
    props.isDraggingOver ? 'lightgrey' : 'inherit'};
  display: flex;
  flex-grow: 1;
  overflow: auto;
`;

class InnerList extends React.Component {
  shouldComponentUpdate(nextProps) {
    if (nextProps.tasks === this.props.tasks) {
      return false;
    }
    return true;
  }
  render() {
    return this.props.tasks.map((task, index) => (
      <Task key={task.id} task={task} index={index} />
    ));
  }
}

export default class Row extends React.Component {
  render() {
    return (
      <Draggable draggableId={this.props.row.id} index={this.props.index}>
        {provided => (
          <Container {...provided.draggableProps} innerRef={provided.innerRef}>
            <Title {...provided.dragHandleProps}>
              <EditText
                defaultValue={this.props.row.title}
                onSave={(_, value) => this.props.row.title = value}
              />
            </Title>
            <Droppable
              droppableId={this.props.row.id}
              type="task"
              direction="horizontal"
            >
              {(provided, snapshot) => (
                <TaskList
                  innerRef={provided.innerRef}
                  {...provided.droppableProps}
                  isDraggingOver={snapshot.isDraggingOver}
                >
                  <InnerList tasks={this.props.tasks} />
                  {provided.placeholder}
                </TaskList>
              )}
            </Droppable>
          </Container>
        )}
      </Draggable>
    );
  }
}
