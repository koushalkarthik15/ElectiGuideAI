const { exec } = require('child_process');

exec('npx playwright test __tests__/registration.spec.ts', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Stderr: ${stderr}`);
  }
  console.log(`Stdout: ${stdout}`);
});
