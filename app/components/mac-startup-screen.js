// @flow

import React, { Component } from 'react';
import styled from 'styled-components';

const StartupContainer = styled.div`
  width: 100%;
  height: 100vh;
  background: #C0C0C0;
  background-image:
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0, 0, 0, 0.03) 2px,
      rgba(0, 0, 0, 0.03) 4px
    ),
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 2px,
      rgba(0, 0, 0, 0.03) 2px,
      rgba(0, 0, 0, 0.03) 4px
    );
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: Chicago, Geneva, "Lucida Grande", -apple-system, system-ui, sans-serif;
`;

const StartupWindow = styled.div`
  width: 500px;
  background: #F0F0F0;
  border: 2px solid #000000;
  box-shadow:
    1px 1px 0 #000000,
    2px 2px 0 #000000,
    3px 3px 0 #000000;
`;

const TitleBar = styled.div`
  height: 20px;
  background: #FFFFFF;
  border-bottom: 1px solid #000000;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const TitleBarLines = styled.div`
  position: absolute;
  top: 6px;
  left: 20px;
  right: 20px;
  height: 8px;
  background: repeating-linear-gradient(
    to bottom,
    #000000 0px,
    #000000 1px,
    transparent 1px,
    transparent 3px
  );
  pointer-events: none;
`;

const WindowTitle = styled.div`
  background: #FFFFFF;
  padding: 0 10px;
  font-size: 11px;
  font-weight: bold;
  z-index: 1;
`;

const ContentArea = styled.div`
  padding: 20px;
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: 20px;
  font-size: 32px;
  font-weight: bold;
`;

const SubTitle = styled.div`
  text-align: center;
  margin-bottom: 30px;
  font-size: 14px;
`;

const TaskList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
`;

const TaskItem = styled.div`
  display: flex;
  align-items: center;
  font-size: 12px;
`;

const Checkbox = styled.div`
  width: 13px;
  height: 13px;
  border: 1px solid #000000;
  background: #FFFFFF;
  margin-right: 10px;
  position: relative;

  ${props => props.checked && `
    &:after {
      content: '✓';
      position: absolute;
      top: -3px;
      left: 1px;
      font-size: 12px;
      font-weight: bold;
    }
  `}

  ${props => props.failed && `
    background: #FF0000;
    &:after {
      content: '✗';
      position: absolute;
      top: -3px;
      left: 2px;
      font-size: 12px;
      font-weight: bold;
      color: #FFFFFF;
    }
  `}
`;

const TaskLabel = styled.span`
  color: ${props => props.failed ? '#FF0000' : '#000000'};
  ${props => props.completed && 'opacity: 0.7;'}
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 16px;
  border: 1px solid #000000;
  background: #FFFFFF;
  position: relative;
  margin-top: 20px;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: repeating-linear-gradient(
    90deg,
    #000000 0px,
    #000000 2px,
    #FFFFFF 2px,
    #FFFFFF 4px
  );
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
`;

const StatusMessage = styled.div`
  text-align: center;
  margin-top: 10px;
  font-size: 11px;
  font-style: italic;
`;

type Props = {
  onComplete: () => void,
};

type State = {
  tasks: Array<{
    id: string,
    label: string,
    completed: boolean,
    failed: boolean,
  }>,
  currentTaskIndex: number,
  statusMessage: string,
};

export class MacStartupScreen extends Component<Props, State> {
  taskTimer: ?IntervalID;

  state = {
    tasks: [
      { id: 'init', label: 'Initializing Zipher Classic System 7.0...', completed: false, failed: false },
      { id: 'config', label: 'Loading configuration...', completed: false, failed: false },
      { id: 'daemon', label: 'Starting Zclassic daemon...', completed: false, failed: false },
      { id: 'sync', label: 'Checking blockchain sync status...', completed: false, failed: false },
      { id: 'wallet', label: 'Loading wallet data...', completed: false, failed: false },
      { id: 'network', label: 'Connecting to Zclassic network...', completed: false, failed: false },
      { id: 'ready', label: 'System ready!', completed: false, failed: false },
    ],
    currentTaskIndex: -1,
    statusMessage: 'Starting up...',
  };

  componentDidMount() {
    this.startTaskSimulation();
  }

  componentWillUnmount() {
    if (this.taskTimer) {
      clearInterval(this.taskTimer);
    }
  }

  startTaskSimulation = () => {
    let index = 0;
    this.taskTimer = setInterval(() => {
      if (index < this.state.tasks.length) {
        this.setState(prevState => ({
          tasks: prevState.tasks.map((task, i) =>
            i === index
              ? { ...task, completed: true }
              : task
          ),
          currentTaskIndex: index,
          statusMessage: this.state.tasks[index].label,
        }));
        index++;
      } else {
        if (this.taskTimer) {
          clearInterval(this.taskTimer);
        }
        setTimeout(() => {
          this.props.onComplete();
        }, 500);
      }
    }, 600);
  };

  getProgress = () => {
    const { tasks } = this.state;
    const completedCount = tasks.filter(t => t.completed || t.failed).length;
    return (completedCount / tasks.length) * 100;
  };

  render() {
    const { tasks, statusMessage } = this.state;
    const progress = this.getProgress();

    return (
      <StartupContainer>
        <StartupWindow>
          <TitleBar>
            <TitleBarLines />
            <WindowTitle>Zipher Classic Startup</WindowTitle>
          </TitleBar>
          <ContentArea>
            <Logo>ZIPHER</Logo>
            <SubTitle>Classic System 7.0</SubTitle>

            <TaskList>
              {tasks.map(task => (
                <TaskItem key={task.id}>
                  <Checkbox
                    checked={task.completed}
                    failed={task.failed}
                  />
                  <TaskLabel
                    completed={task.completed}
                    failed={task.failed}
                  >
                    {task.label}
                  </TaskLabel>
                </TaskItem>
              ))}
            </TaskList>

            <ProgressBar>
              <ProgressFill progress={progress} />
            </ProgressBar>

            <StatusMessage>{statusMessage}</StatusMessage>
          </ContentArea>
        </StartupWindow>
      </StartupContainer>
    );
  }
}