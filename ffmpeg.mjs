import { spawn } from 'child_process';

const processes = {};

function run(command) {
    const process = spawn(command, { shell: true });
    const startTime = Date.now();
    const pid = (+`${startTime}${process.pid}`).toString(36);

    processes[pid]  = {
        command: command,
        startedAt: startTime,
        finishedAt: -1,
        exitCode: -1,
        done: false,
        stderr: "",
        duration: 0,
        currentTime: 0
    };

    // ffmpeg output to stderr
    process.stderr.on('data', (data) => {
        const text = `${data}`;
        processes[pid].stderr = text;
        if (!processes[pid].duration) {
            const m = text.match(/Duration: ([0-9]+):([0-9]+):([0-9]+.[0-9]+)/);
            if (m) {
                processes[pid].duration = +m[1] * 3600 + +m[2] * 60 + +m[3];
            }
        } else {
            const m = text.match(/ time=([0-9]+):([0-9]+):([0-9]+.[0-9]+) /);
            if (m) {
                processes[pid].currentTime = +m[1] * 3600 + +m[2] * 60 + +m[3];
            }
        }
    });

    process.on('close', (code) => {
        processes[pid].finishedAt = Date.now();
        processes[pid].exitCode = code;
        processes[pid].done = true;
    });

    return pid;
}

export { run, processes }