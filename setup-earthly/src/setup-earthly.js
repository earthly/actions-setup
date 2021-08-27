import * as core from '@actions/core';
import { exec } from 'child_process'

const IS_MAC = process.platform === 'darwin';

try {
  const version = core.getInput('version');
  console.log(`Setting up earthly version=${version}`);

  let installCommand = "";
  if (IS_MAC) {
    throw new Error('earthly/actions/setup-earthly doesnt support macOS; earthly must be installed manually');
  } else {
    let url = `https://github.com/earthly/earthly/releases/latest/download/earthly-linux-amd64`
    if (version != 'latest') {
      url = `https://github.com/earthly/earthly/releases/download/${version}/earthly-linux-amd64`
    }
    installCommand = `sudo /bin/sh -c 'wget -q ${url} -O /usr/local/bin/earthly && chmod +x /usr/local/bin/earthly'`
  }

  exec(installCommand, (error, stdout, stderr) => {
    if (error) {
      throw error;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
    }
    console.log(`stdout: ${stdout}`);
  });
  core.exportVariable('FORCE_COLOR', '1');
} catch (error) {
  core.setFailed(error.message);
}
