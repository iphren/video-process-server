import express from "express";
import { router } from "./router.mjs";

const port = 56765;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(router);

app.listen(port, () => console.log(`video process server is listening on ${port}`));

export { }
