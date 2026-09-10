import { execSync } from 'child_process';
const output = execSync('ps aux').toString();
for (const line of output.split('\n')) {
  if (line.includes('tsx server.ts') || line.includes('node server')) {
    const parts = line.trim().split(/\s+/);
    if (parts[1] && parts[1] !== process.pid.toString()) {
      try { process.kill(parts[1], 'SIGKILL'); } catch(e){}
    }
  }
}
