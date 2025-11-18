// @flow
import React, { Component } from 'react';
import styled from 'styled-components';
import { format } from 'date-fns';
import eres from 'eres';

import {
  createBackup,
  listBackups,
  verifyBackup,
  restoreBackup,
  deleteBackup,
  exportBackup,
  getBackupDirectory,
} from '../../services/backup-service';
import { ConfirmDialog } from '../components/confirm-dialog';

const Wrapper = styled.div`
  width: 100%;
  padding: 30px;
  background: ${props => props.theme.colors.background};
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  font-size: 28px;
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const CreateButton = styled.button`
  padding: 12px 24px;
  background: ${props => props.theme.colors.buttonPrimaryBg};
  color: ${props => props.theme.colors.buttonPrimaryText};
  border: 1px solid ${props => props.theme.colors.buttonBorder};
  border-radius: ${props => props.theme.boxBorderRadius};
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;

  &:hover {
    background: ${props => props.theme.colors.buttonPrimaryHover};
  }

  &:disabled {
    background: ${props => props.theme.colors.buttonPrimaryDisabled};
    cursor: not-allowed;
  }
`;

const BackupList = styled.div`
  background: ${props => props.theme.colors.cardBackground};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.boxBorderRadius};
  overflow: hidden;
`;

const BackupItem = styled.div`
  display: grid;
  grid-template-columns: 1fr 150px 100px 80px 200px;
  gap: 15px;
  padding: 15px 20px;
  border-bottom: 1px solid ${props => props.theme.colors.borderLight};
  align-items: center;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${props => props.theme.colors.backgroundLight};
  }
`;

const BackupInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const BackupName = styled.div`
  font-size: 14px;
  font-weight: bold;
  color: ${props => props.theme.colors.text};
  font-family: ${props => props.theme.fontCode};
`;

const BackupDate = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.textMuted};
`;

const BackupSize = styled.div`
  font-size: 13px;
  color: ${props => props.theme.colors.text};
`;

const VerifyStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: ${props => props.verified === true
    ? props.theme.colors.success
    : props.verified === false
      ? props.theme.colors.error
      : props.theme.colors.textMuted};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
`;

const ActionButton = styled.button`
  padding: 6px 12px;
  background: ${props => props.danger
    ? props.theme.colors.error
    : props.theme.colors.buttonSecondaryBg};
  color: ${props => props.danger
    ? props.theme.colors.buttonPrimaryText
    : props.theme.colors.buttonSecondaryText};
  border: 1px solid ${props => props.theme.colors.buttonBorder};
  border-radius: ${props => props.theme.boxBorderRadius};
  cursor: pointer;
  font-size: 12px;

  &:hover {
    background: ${props => props.danger
      ? '#FF0000'
      : props.theme.colors.buttonSecondaryHover};
  }

  &:disabled {
    background: ${props => props.theme.colors.buttonSecondaryDisabled};
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  padding: 60px 20px;
  text-align: center;
  color: ${props => props.theme.colors.textMuted};
  font-size: 16px;
`;

const StatusMessage = styled.div`
  padding: 12px 20px;
  margin-bottom: 20px;
  background: ${props => props.error
    ? props.theme.colors.error
    : props.theme.colors.success};
  color: ${props => props.theme.colors.buttonPrimaryText};
  border-radius: ${props => props.theme.boxBorderRadius};
  font-size: 14px;
`;

const LoadingMessage = styled.div`
  padding: 20px;
  text-align: center;
  color: ${props => props.theme.colors.textMuted};
  font-size: 14px;
`;

const BackupLocation = styled.div`
  margin-bottom: 20px;
  padding: 12px;
  background: ${props => props.theme.colors.backgroundLight};
  border: 1px solid ${props => props.theme.colors.borderLight};
  border-radius: ${props => props.theme.boxBorderRadius};
  font-size: 12px;
  color: ${props => props.theme.colors.textMuted};
  font-family: ${props => props.theme.fontCode};
`;

type Backup = {
  filename: string,
  path: string,
  timestamp: Date,
  size: number,
  verified: boolean | null,
};

type Props = {};

type State = {
  backups: Backup[],
  loading: boolean,
  creating: boolean,
  statusMessage: string | null,
  errorMessage: string | null,
  confirmDialog: {
    isOpen: boolean,
    title: string,
    message: string,
    onConfirm: () => void,
  } | null,
  backupLocation: string,
};

export class BackupManagerView extends Component<Props, State> {
  state = {
    backups: [],
    loading: true,
    creating: false,
    statusMessage: null,
    errorMessage: null,
    confirmDialog: null,
    backupLocation: '',
  };

  async componentDidMount() {
    await this.loadBackups();
    await this.loadBackupLocation();
  }

  loadBackupLocation = async () => {
    const [err, location] = await eres(getBackupDirectory());
    if (!err && location) {
      this.setState({ backupLocation: location });
    }
  };

  loadBackups = async () => {
    this.setState({ loading: true });
    const [err, backups] = await eres(listBackups());

    if (err) {
      this.setState({
        loading: false,
        errorMessage: 'Failed to load backups',
      });
      return;
    }

    this.setState({
      backups: backups || [],
      loading: false,
    });
  };

  handleCreateBackup = async () => {
    this.setState({ creating: true, statusMessage: null, errorMessage: null });

    const [err, result] = await eres(createBackup());

    if (err || !result || !result.success) {
      this.setState({
        creating: false,
        errorMessage: result?.error || 'Failed to create backup',
      });
      return;
    }

    this.setState({
      creating: false,
      statusMessage: 'Backup created successfully',
    });

    await this.loadBackups();

    // Clear message after 5 seconds
    setTimeout(() => {
      this.setState({ statusMessage: null });
    }, 5000);
  };

  handleVerifyBackup = async (backup: Backup) => {
    const [err, result] = await eres(verifyBackup(backup.path));

    const verified = result?.valid === true;

    this.setState(prevState => ({
      backups: prevState.backups.map(b =>
        b.path === backup.path ? { ...b, verified } : b
      ),
    }));

    if (!verified) {
      this.setState({
        errorMessage: result?.error || 'Backup verification failed',
      });
      setTimeout(() => {
        this.setState({ errorMessage: null });
      }, 5000);
    }
  };

  handleRestoreBackup = (backup: Backup) => {
    this.setState({
      confirmDialog: {
        isOpen: true,
        title: 'Restore Backup',
        message: `Are you sure you want to restore this backup? Your current wallet will be backed up first. You will need to restart Zipher after restoring.`,
        onConfirm: () => this.confirmRestoreBackup(backup),
      },
    });
  };

  confirmRestoreBackup = async (backup: Backup) => {
    this.setState({ confirmDialog: null, statusMessage: null, errorMessage: null });

    const [err, result] = await eres(restoreBackup(backup.path));

    if (err || !result || !result.success) {
      this.setState({
        errorMessage: result?.error || 'Failed to restore backup',
      });
      return;
    }

    this.setState({
      statusMessage: 'Backup restored successfully! Please restart Zipher.',
    });
  };

  handleDeleteBackup = (backup: Backup) => {
    this.setState({
      confirmDialog: {
        isOpen: true,
        title: 'Delete Backup',
        message: `Are you sure you want to delete this backup? This action cannot be undone.`,
        onConfirm: () => this.confirmDeleteBackup(backup),
      },
    });
  };

  confirmDeleteBackup = async (backup: Backup) => {
    this.setState({ confirmDialog: null, statusMessage: null, errorMessage: null });

    const [err, result] = await eres(deleteBackup(backup.path));

    if (err || !result || !result.success) {
      this.setState({
        errorMessage: result?.error || 'Failed to delete backup',
      });
      return;
    }

    this.setState({
      statusMessage: 'Backup deleted successfully',
    });

    await this.loadBackups();

    setTimeout(() => {
      this.setState({ statusMessage: null });
    }, 3000);
  };

  handleExportBackup = async (backup: Backup) => {
    const result = await window.electronAPI.showSaveDialog({
      defaultPath: backup.filename,
      filters: [{ name: 'ZIP Files', extensions: ['zip'] }],
    });

    if (result.canceled || !result.filePath) {
      return;
    }

    const [err, exportResult] = await eres(exportBackup(backup.path, result.filePath));

    if (err || !exportResult || !exportResult.success) {
      this.setState({
        errorMessage: exportResult?.error || 'Failed to export backup',
      });
      return;
    }

    this.setState({
      statusMessage: `Backup exported to ${result.filePath}`,
    });

    setTimeout(() => {
      this.setState({ statusMessage: null });
    }, 5000);
  };

  handleCloseConfirmDialog = () => {
    this.setState({ confirmDialog: null });
  };

  formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  render() {
    const {
      backups,
      loading,
      creating,
      statusMessage,
      errorMessage,
      confirmDialog,
      backupLocation,
    } = this.state;

    return (
      <Wrapper>
        <Header>
          <Title>Backup Manager</Title>
          <CreateButton onClick={this.handleCreateBackup} disabled={creating}>
            {creating ? 'Creating...' : '+ Create Backup'}
          </CreateButton>
        </Header>

        {backupLocation && (
          <BackupLocation>
            Backup Location: {backupLocation}
          </BackupLocation>
        )}

        {statusMessage && <StatusMessage>{statusMessage}</StatusMessage>}
        {errorMessage && <StatusMessage error>{errorMessage}</StatusMessage>}

        {loading && <LoadingMessage>Loading backups...</LoadingMessage>}

        {!loading && backups.length === 0 && (
          <BackupList>
            <EmptyState>
              No backups found. Create your first backup to get started.
            </EmptyState>
          </BackupList>
        )}

        {!loading && backups.length > 0 && (
          <BackupList>
            {backups.map(backup => (
              <BackupItem key={backup.path}>
                <BackupInfo>
                  <BackupName>{backup.filename}</BackupName>
                  <BackupDate>
                    {format(backup.timestamp, 'MMM d, yyyy - h:mm:ss a')}
                  </BackupDate>
                </BackupInfo>

                <BackupSize>{this.formatSize(backup.size)}</BackupSize>

                <VerifyStatus verified={backup.verified}>
                  {backup.verified === true && '✓ Verified'}
                  {backup.verified === false && '⚠ Invalid'}
                  {backup.verified === null && (
                    <button
                      onClick={() => this.handleVerifyBackup(backup)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'inherit',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                      }}
                    >
                      Verify
                    </button>
                  )}
                </VerifyStatus>

                <ActionButtons>
                  <ActionButton onClick={() => this.handleRestoreBackup(backup)}>
                    Restore
                  </ActionButton>
                  <ActionButton onClick={() => this.handleExportBackup(backup)}>
                    Export
                  </ActionButton>
                  <ActionButton danger onClick={() => this.handleDeleteBackup(backup)}>
                    Delete
                  </ActionButton>
                </ActionButtons>
              </BackupItem>
            ))}
          </BackupList>
        )}

        {confirmDialog && (
          <ConfirmDialog
            title={confirmDialog.title}
            onConfirm={confirmDialog.onConfirm}
            onCancel={this.handleCloseConfirmDialog}
          >
            {confirmDialog.message}
          </ConfirmDialog>
        )}
      </Wrapper>
    );
  }
}
