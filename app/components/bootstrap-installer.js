// @flow
/**
 * Bootstrap Installer Component
 * Provides smooth user experience for fast blockchain sync
 */

import React, { Component } from 'react';
import styled from 'styled-components';

import {
  installBootstrap,
  fetchBootstrapMetadata,
  shouldRecommendBootstrap,
  getEstimatedInstallTime,
} from '../../services/bootstrap-installer';
import eres from 'eres';

const Wrapper = styled.div`
  width: 600px;
  background: ${props => props.theme.colors.cardBackground};
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.boxBorderRadius};
  padding: 30px;
  box-shadow: ${props => props.theme.colors.transactionDetailsShadow};
`;

const Title = styled.h2`
  font-size: 24px;
  color: ${props => props.theme.colors.text};
  margin: 0 0 20px 0;
`;

const Description = styled.p`
  font-size: 14px;
  color: ${props => props.theme.colors.textMuted};
  line-height: 1.6;
  margin: 0 0 20px 0;
`;

const InfoBox = styled.div`
  background: ${props => props.theme.colors.backgroundLight};
  border: 1px solid ${props => props.theme.colors.borderLight};
  border-radius: 4px;
  padding: 15px;
  margin: 20px 0;
`;

const InfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 13px;
  color: ${props => props.theme.colors.text};

  &:not(:last-child) {
    border-bottom: 1px solid ${props => props.theme.colors.borderLight};
  }
`;

const InfoLabel = styled.span`
  color: ${props => props.theme.colors.textMuted};
`;

const InfoValue = styled.span`
  font-weight: bold;
  color: ${props => props.theme.colors.text};
`;

const ProgressSection = styled.div`
  margin: 30px 0;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 30px;
  background: ${props => props.theme.colors.progressBackground};
  border-radius: 15px;
  overflow: hidden;
  position: relative;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: ${props => props.theme.colors.progressBar};
  transition: width 0.3s ease;
  width: ${props => props.progress}%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ProgressText = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 12px;
  font-weight: bold;
  color: ${props => props.theme.colors.text};
  z-index: 1;
`;

const StageText = styled.div`
  margin-top: 10px;
  font-size: 13px;
  color: ${props => props.theme.colors.textMuted};
  text-align: center;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 30px;
`;

const Button = styled.button`
  padding: 12px 30px;
  font-size: 14px;
  font-weight: bold;
  border-radius: ${props => props.theme.boxBorderRadius};
  cursor: pointer;
  transition: background 0.2s;

  ${props =>
    props.primary
      ? `
    background: ${props.theme.colors.buttonPrimaryBg};
    color: ${props.theme.colors.buttonPrimaryText};
    border: 1px solid ${props.theme.colors.buttonBorder};

    &:hover:not(:disabled) {
      background: ${props.theme.colors.buttonPrimaryHover};
    }
  `
      : `
    background: ${props.theme.colors.buttonSecondaryBg};
    color: ${props.theme.colors.buttonSecondaryText};
    border: 1px solid ${props.theme.colors.buttonBorder};

    &:hover:not(:disabled) {
      background: ${props.theme.colors.buttonSecondaryHover};
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const WarningBox = styled.div`
  background: ${props => props.theme.colors.warning}22;
  border: 2px solid ${props => props.theme.colors.warning};
  border-radius: 4px;
  padding: 15px;
  margin: 20px 0;
`;

const WarningText = styled.div`
  font-size: 13px;
  color: ${props => props.theme.colors.text};
  line-height: 1.6;

  strong {
    color: ${props => props.theme.colors.warning};
  }
`;

const SuccessBox = styled.div`
  background: ${props => props.theme.colors.success}22;
  border: 2px solid ${props => props.theme.colors.success};
  border-radius: 4px;
  padding: 20px;
  text-align: center;
`;

const SuccessText = styled.div`
  font-size: 16px;
  font-weight: bold;
  color: ${props => props.theme.colors.success};
  margin-bottom: 10px;
`;

const SuccessDescription = styled.div`
  font-size: 13px;
  color: ${props => props.theme.colors.textMuted};
  line-height: 1.6;
`;

type Props = {
  onClose: () => void,
  onComplete: () => void,
};

type State = {
  loading: boolean,
  installing: boolean,
  completed: boolean,
  error: string | null,
  metadata: any | null,
  stage: string,
  progress: number,
  message: string,
};

export class BootstrapInstaller extends Component<Props, State> {
  state = {
    loading: true,
    installing: false,
    completed: false,
    error: null,
    metadata: null,
    stage: '',
    progress: 0,
    message: '',
  };

  async componentDidMount() {
    await this.loadMetadata();
  }

  loadMetadata = async () => {
    this.setState({ loading: true });

    const [err, result] = await eres(fetchBootstrapMetadata());

    if (err || !result || !result.success) {
      this.setState({
        loading: false,
        error: 'Failed to fetch bootstrap information. Please check your internet connection.',
      });
      return;
    }

    this.setState({
      loading: false,
      metadata: result.metadata,
    });
  };

  handleProgressUpdate = (stage: string, progress: number, message: string) => {
    this.setState({ stage, progress, message });
  };

  handleInstall = async () => {
    this.setState({
      installing: true,
      stage: 'init',
      progress: 0,
      message: 'Initializing...',
      error: null,
    });

    const [err, result] = await eres(installBootstrap(this.handleProgressUpdate));

    if (err || !result || !result.success) {
      this.setState({
        installing: false,
        error: result?.error || 'Installation failed. Please try again.',
      });
      return;
    }

    this.setState({
      installing: false,
      completed: true,
      progress: 100,
    });
  };

  handleComplete = () => {
    this.props.onComplete();
    this.props.onClose();
  };

  renderInitialView() {
    const { metadata, loading, error } = this.state;

    if (loading) {
      return (
        <Wrapper>
          <Title>⚡ Fast Sync with Bootstrap</Title>
          <Description>Loading bootstrap information...</Description>
        </Wrapper>
      );
    }

    if (error || !metadata) {
      return (
        <Wrapper>
          <Title>⚡ Fast Sync with Bootstrap</Title>
          <Description style={{ color: '#FF0000' }}>{error || 'Failed to load'}</Description>
          <ButtonRow>
            <Button onClick={this.props.onClose}>Close</Button>
            <Button primary onClick={this.loadMetadata}>
              Retry
            </Button>
          </ButtonRow>
        </Wrapper>
      );
    }

    return (
      <Wrapper>
        <Title>⚡ Fast Sync with Bootstrap</Title>

        <Description>
          Speed up your initial sync by downloading pre-synced blockchain data. This is much faster
          than syncing from peers.
        </Description>

        <InfoBox>
          <InfoItem>
            <InfoLabel>Download Size:</InfoLabel>
            <InfoValue>{metadata.bootstrap.size_human}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Block Height:</InfoLabel>
            <InfoValue>~{metadata.bootstrap.block_height_estimate.toLocaleString()}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Block Files:</InfoLabel>
            <InfoValue>{metadata.bootstrap.block_count}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Estimated Time:</InfoLabel>
            <InfoValue>{metadata.installation.total_estimated_minutes} minutes</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Created:</InfoLabel>
            <InfoValue>
              {new Date(metadata.bootstrap.created).toLocaleDateString()}
            </InfoValue>
          </InfoItem>
        </InfoBox>

        <WarningBox>
          <WarningText>
            <strong>⚠️ Important:</strong>
            <br />
            <br />
            • Your wallet will be automatically backed up before installation
            <br />
            • The daemon will be restarted after installation
            <br />
            • Index rebuild will take 10-30 minutes after extraction
            <br />• Do not close Zipher during installation
          </WarningText>
        </WarningBox>

        <ButtonRow>
          <Button onClick={this.props.onClose}>Maybe Later</Button>
          <Button primary onClick={this.handleInstall}>
            Install Bootstrap
          </Button>
        </ButtonRow>
      </Wrapper>
    );
  }

  renderInstallingView() {
    const { stage, progress, message } = this.state;

    const stageNames = {
      init: 'Initializing',
      backup: 'Backing Up Wallet',
      download: 'Downloading Bootstrap',
      verify: 'Verifying Download',
      cleanup: 'Preparing Installation',
      extract: 'Extracting Blockchain Data',
      complete: 'Complete',
    };

    return (
      <Wrapper>
        <Title>⚡ Installing Bootstrap</Title>

        <Description>
          Please wait while the bootstrap is being installed. This may take 10-20 minutes.
        </Description>

        <ProgressSection>
          <ProgressBar>
            <ProgressFill progress={progress} />
            <ProgressText>{progress.toFixed(0)}%</ProgressText>
          </ProgressBar>

          <StageText>
            <strong>{stageNames[stage] || 'Processing'}</strong>
            <br />
            {message}
          </StageText>
        </ProgressSection>

        <WarningBox>
          <WarningText>
            <strong>⚠️ Do not close Zipher</strong>
            <br />
            The installation is in progress. Closing now may corrupt your blockchain data.
          </WarningText>
        </WarningBox>
      </Wrapper>
    );
  }

  renderCompletedView() {
    return (
      <Wrapper>
        <Title>✅ Bootstrap Installed Successfully!</Title>

        <SuccessBox>
          <SuccessText>🎉 Installation Complete</SuccessText>
          <SuccessDescription>
            The bootstrap has been installed successfully.
            <br />
            <br />
            The daemon will now rebuild the block index, which takes 10-30 minutes.
            <br />
            You can use Zipher normally during this process.
          </SuccessDescription>
        </SuccessBox>

        <InfoBox>
          <InfoItem>
            <InfoLabel>What happens next:</InfoLabel>
          </InfoItem>
          <Description style={{ marginTop: '10px', marginBottom: '10px' }}>
            1. Daemon restarts automatically
            <br />
            2. Block index is rebuilt (10-30 min)
            <br />
            3. Blockchain syncs remaining blocks
            <br />
            4. Wallet becomes fully functional
          </Description>
        </InfoBox>

        <ButtonRow>
          <Button primary onClick={this.handleComplete}>
            Continue to Zipher
          </Button>
        </ButtonRow>
      </Wrapper>
    );
  }

  renderErrorView() {
    const { error } = this.state;

    return (
      <Wrapper>
        <Title>❌ Installation Failed</Title>

        <Description style={{ color: '#FF0000' }}>
          {error || 'An unknown error occurred during installation.'}
        </Description>

        <WarningBox>
          <WarningText>
            <strong>What to try:</strong>
            <br />
            <br />
            • Check your internet connection
            <br />
            • Make sure you have enough disk space (~2GB)
            <br />
            • Restart Zipher and try again
            <br />• If the problem persists, sync normally without bootstrap
          </WarningText>
        </WarningBox>

        <ButtonRow>
          <Button onClick={this.props.onClose}>Close</Button>
          <Button primary onClick={this.handleInstall}>
            Try Again
          </Button>
        </ButtonRow>
      </Wrapper>
    );
  }

  render() {
    const { installing, completed, error } = this.state;

    if (completed) {
      return this.renderCompletedView();
    }

    if (error && !installing) {
      return this.renderErrorView();
    }

    if (installing) {
      return this.renderInstallingView();
    }

    return this.renderInitialView();
  }
}
