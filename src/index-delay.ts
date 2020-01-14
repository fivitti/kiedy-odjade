import "papercss/dist/paper.min.css";
import "./main.css";
import "./loader.css";

import DelayApp from "./delay-app";

const app = new DelayApp("content");
app.init()
    .then(() => app.redraw())
    .catch((err) => {
        console.error(err);
        console.log(err.stack);
        document.writeln("Error:", err.toString(), "Message:", err.message, "Stack:", err.stack);
    });