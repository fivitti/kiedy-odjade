import "./main.css";
import "papercss/dist/paper.min.css";
import App from "./app";
const app = new App("content");
app.init()
    .then(() => app.refresh())
    .then(() => app.render());
//# sourceMappingURL=index.js.map