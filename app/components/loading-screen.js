// @flow

import React, { PureComponent } from 'react';
import styled, { withTheme } from 'styled-components';
import { Transition, animated } from 'react-spring';

import CircleProgressComponent from 'react-circle';
import { TextComponent } from './text';

import zclassicLogo from '../assets/images/zclassic-simple-icon.svg';

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

// Old style wrapper for compatibility
const Wrapper = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.theme.colors.loadingScreenBg};
`;

type Props = {
  progress: number,
  theme: AppTheme,
  message: string,
};

type State = {
  start: boolean,
  tasks: Array<{
    id: string,
    label: string,
    completed: boolean,
    failed: boolean,
  }>,
};

const TIME_DELAY_ANIM = 100;

class Component extends PureComponent<Props, State> {
  state = {
    start: false,
    tasks: [
      { id: 'init', label: 'Initializing Zipher Classic System 7.0...', completed: false, failed: false },
      { id: 'config', label: 'Loading configuration...', completed: false, failed: false },
      { id: 'daemon', label: 'Starting Zclassic daemon...', completed: false, failed: false },
      { id: 'sync', label: 'Checking blockchain sync status...', completed: false, failed: false },
      { id: 'wallet', label: 'Loading wallet data...', completed: false, failed: false },
      { id: 'network', label: 'Connecting to Zclassic network...', completed: false, failed: false },
      { id: 'ready', label: 'System ready!', completed: false, failed: false },
    ],
  };

  componentDidMount() {
    setTimeout(() => {
      this.setState(() => ({ start: true }));
    }, TIME_DELAY_ANIM);
  }

  componentDidUpdate(prevProps: Props) {
    const { progress, message } = this.props;

    // Update tasks based on progress and message
    if (prevProps.progress !== progress || prevProps.message !== message) {
      this.updateTasks();
    }
  }

  updateTasks = () => {
    const { progress, message } = this.props;
    const { tasks } = this.state;

    const newTasks = [...tasks];

    // Determine which tasks should be completed based on progress
    const taskProgress = [
      { threshold: 10, id: 'init' },
      { threshold: 20, id: 'config' },
      { threshold: 40, id: 'daemon' },
      { threshold: 60, id: 'sync' },
      { threshold: 80, id: 'wallet' },
      { threshold: 90, id: 'network' },
      { threshold: 99, id: 'ready' },
    ];

    taskProgress.forEach(({ threshold, id }) => {
      const taskIndex = newTasks.findIndex(t => t.id === id);
      if (taskIndex !== -1 && progress >= threshold) {
        newTasks[taskIndex].completed = true;
      }
    });

    // Update message for current task
    const currentTaskIndex = newTasks.findIndex(t => !t.completed && !t.failed);
    if (currentTaskIndex !== -1 && message) {
      // Update the label of the current task with the actual message
      if (message.includes('daemon')) {
        const daemonIndex = newTasks.findIndex(t => t.id === 'daemon');
        if (daemonIndex !== -1) newTasks[daemonIndex].label = message;
      } else if (message.includes('sync') || message.includes('Sync')) {
        const syncIndex = newTasks.findIndex(t => t.id === 'sync');
        if (syncIndex !== -1) newTasks[syncIndex].label = message;
      }
    }

    this.setState({ tasks: newTasks });
  };

  render() {
    const { start, tasks } = this.state;
    const { progress, message } = this.props;

    return (
      <Wrapper data-testid='LoadingScreen'>
        <Transition
          native
          items={start}
          enter={[{ height: 'auto', opacity: 1 }]}
          leave={{ height: 0, opacity: 0 }}
          from={{
            position: 'absolute',
            overflow: 'hidden',
            height: 0,
            opacity: 0,
          }}
        >
          {() => (props: Object) => (
            <animated.div
              id='loading-screen'
              style={{
                ...props,
                width: '100%',
                height: '100%',
              }}
            >
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

                    <StatusMessage>{message}</StatusMessage>
                  </ContentArea>
                </StartupWindow>
              </StartupContainer>
            </animated.div>
          )}
        </Transition>
      </Wrapper>
    );
  }
}

export const LoadingScreen = withTheme(Component);