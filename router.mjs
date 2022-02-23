import express from 'express';
import fs from 'fs';
import tempfile from 'tempfile';
import { run, processes } from './ffmpeg.mjs';

const router = express.Router();

router.get('/', (_, res) => {
    res.json(processes);
});

router.get('/:pid', (req, res) => {
    if (req.params.pid in processes) {
        res.json(processes[req.params.pid]);
    } else {
        res.status(404).end();
    }
});

router.delete('/', (_, res) => {
    for (let pid in processes) {
        if (processes[pid].done) {
            delete processes[pid];
        }
    }
});

const global = (o) => ((a, _, c) => { a.body.global = o; c(); });
const option = (o) => ((a, _, c) => { a.body.option = o; c(); });
const ffmpeg = (req, res) => {
    if (!('global' in req.body)) {
        req.body.global = '-y';
    }
    const pid = run(`ffmpeg ${req.body.global} -i "${req.body.input}" ${req.body.option} "${req.body.output}"`);
    res.json({ pid: pid });
};

router.post('/', ffmpeg);
router.post('/waveform', option('-filter_complex "showwavespic=s=1280x120" -frames:v 1'), ffmpeg);
router.post('/normalize', option('-filter:a loudnorm'), ffmpeg);

router.post('/trim', (req, _, next) => {
    req.body.option = `-ss ${req.body.from} -to ${req.body.to} -c:v libx264 -c:a copy`;
    next();
}, ffmpeg);

router.post('/concat', (req, _, next) => {
    req.body.input = tempfile('.txt');
    var playlist = '';
    for (let file of req.body.inputs) {
        playlist += `file '${file}'\n`
    }
    fs.writeFileSync(req.body.input, playlist);
    next();
}, global('-f concat -safe 0 -y'), option('-c copy'), ffmpeg);

export { router }
