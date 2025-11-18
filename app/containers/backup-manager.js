// @flow
import { connect } from 'react-redux';
import { BackupManagerView } from '../views/backup-manager';

import type { AppState } from '../types/app-state';

const mapStateToProps = (state: AppState) => ({
  // Currently no Redux state needed, but keeping pattern for consistency
});

export const BackupManagerContainer = connect(mapStateToProps)(BackupManagerView);
