import { NextResponse } from 'next/server';
import { spawn } from 'child_process';

export async function POST() {
  return new Promise((resolve) => {
    const pythonProcess = spawn('python', ['main.py']);

    pythonProcess.stdout.on('data', (data) => {
      console.log(`Python Output: ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`Python Error: ${data}`);
    });

    pythonProcess.on('close', (code) => {
      console.log(`Python process exited with code ${code}`);
      resolve(NextResponse.json({ success: code === 0 }));
    });
  });
}
