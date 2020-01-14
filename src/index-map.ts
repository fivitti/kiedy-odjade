import "papercss/dist/paper.min.css";
import "./map.css";
import "./loader.css";
import App from "./map-app";

const app = new App("content");
app.init()
    .then(() => app.redraw())
    .catch((err) => {
        console.error(err);
        console.log(err.stack);
        document.writeln("Error:", err.toString(), "Message:", err.message, "Stack:", err.stack);
    });
