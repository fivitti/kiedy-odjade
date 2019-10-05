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
        document.writeln("Error:", err.toString(), "Message:", err.message, "Stack:", err.stack);
    });