import "papercss/dist/paper.min.css";
import "./main.css";

import App from "./app";

const app = new App("content");
app.init()
    .then(() => app.redraw())
    .catch((err) => {
        console.error(err);
        console.log(err.stack);
        document.writeln("Error:", err.toString(), "Message:", err.message, "Stack:", err.stack);
    });