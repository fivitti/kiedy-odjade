import "./main.css";
import "papercss/dist/paper.min.css";

import App from "./app";

const app = new App("content");
app.init()
    .then(() => app.refresh())
    .then(() => app.render())
    .catch((err) => {
        console.error(err);
        console.log(err.stack);
        document.writeln("Error:",err.toString());
        document.writeln("Message:", err.message);
        document.writeln("Stack:", err.stack);
    });