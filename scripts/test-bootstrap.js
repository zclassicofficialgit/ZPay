#!/usr/bin/env node

const BootstrapInstaller = require('./bootstrap-installer.js');
const readline = require('readline');

console.log('🚀 Zipher Bootstrap Installer Test\n');
console.log('This will download and install the Zclassic blockchain bootstrap');
console.log('Source: https://github.com/VictorLux/zclassic-bootstrap');
console.log('Size: 8.3 GB (compressed)\n');

const installer = new BootstrapInstaller();

// Progress tracking
installer.onProgress((info) => {
  // Clear previous line and show progress
  process.stdout.clearLine?.(0);
  process.stdout.cursorTo?.(0);

  const progressBar = '█'.repeat(Math.floor(info.progress / 5)) + '░'.repeat(20 - Math.floor(info.progress / 5));

  process.stdout.write(`[${info.step}/5] ${info.stepName}: [${progressBar}] ${info.progress.toFixed(1)}%`);

  if (info.downloaded) {
    process.stdout.write(` | ${info.downloaded} GB / ${info.total} GB @ ${info.speed} MB/s | ETA: ${info.timeRemaining}`);
  }
});

// Completion handler
installer.onComplete((result) => {
  console.log('\n');
  if (result.skipped) {
    console.log('✅ Bootstrap installation skipped - blockchain data already exists');
  } else {
    console.log('✅ Bootstrap installation complete!');
    console.log('\nNext steps:');
    console.log('  1. Start zclassicd daemon');
    console.log('  2. Wait for blockchain to sync remaining blocks');
  }
  process.exit(0);
});

// Error handler with user prompts
installer.onError(async (error) => {
  console.log('\n');

  if (error.requiresConfirmation) {
    console.log('⚠️  CONFIRMATION REQUIRED:\n');
    console.log(error.message);
    console.log('\n⚠️  WARNING: This will OVERWRITE your existing blockchain data!');
    console.log('Make sure you have backed up your wallet.dat file.\n');

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('Type YES to continue, or anything else to cancel: ', (answer) => {
      rl.close();
      if (answer.trim().toUpperCase() === 'YES') {
        console.log('\n✅ Confirmed. Starting installation...\n');
        installer.install();
      } else {
        console.log('❌ Installation cancelled by user');
        process.exit(1);
      }
    });

  } else if (error.daemonRunning) {
    console.log('⚠️  DAEMON RUNNING:\n');
    console.log(error.message);
    console.log('\nThe zclassicd daemon must be stopped before installing bootstrap.\n');

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('Would you like to stop the daemon now? (YES/no): ', async (answer) => {
      rl.close();
      if (answer.trim().toUpperCase() === 'YES' || answer.trim() === '') {
        console.log('\n⏳ Stopping zclassicd daemon...');
        try {
          await installer.stopDaemon();
          console.log('✅ Daemon stopped successfully\n');
          console.log('🚀 Starting bootstrap installation...\n');
          installer.install();
        } catch (err) {
          console.error('❌ Failed to stop daemon:', err.message);
          process.exit(1);
        }
      } else {
        console.log('\n❌ Installation cancelled. Please stop zclassicd manually and try again.');
        console.log('   Stop command: zclassic-cli stop');
        process.exit(1);
      }
    });

  } else {
    console.error('❌ Installation failed:', error.message);
    if (error.details) {
      console.error('\nDetails:', error.details);
    }
    process.exit(1);
  }
});

// Start installation
console.log('🔍 Running pre-installation checks...\n');
installer.install();
