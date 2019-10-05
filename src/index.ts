import "./main.css";
import "papercss/dist/paper.min.css";

console.log("Start");
import App from "./app";

const app = new App("content");
console.log("Create oject");
app.init()
    .then(() => app.refresh())
    .then(() => app.render())
    .catch((err) => console.error(err));