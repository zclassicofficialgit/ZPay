// @flow

import os from 'os';

// eslint-disable-next-line
export default () => (os.platform() === 'win32' ? 'zclassicd' : 'zclassicd');
