import express from "express";
import { run, processes } from "./ffmpeg.mjs";

const router = express.Router();

router.get('/', (req, res) => {
    res.json(processes);
});

router.post('/', (req, res) => {
    const pid = run(req.body.command);
    res.json({ pid: pid });
});

router.get('/:pid', (req, res) => {
    if (req.params.pid in processes) {
        res.json(processes[req.params.pid]);
    } else {
        res.status(404).end();
    }
});

export { router }

