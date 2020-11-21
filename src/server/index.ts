import express from "express"
import { join } from "path";
import { static as estatic } from "express"
import Webpack from "webpack"
import WebpackDevMiddleware from "webpack-dev-middleware"

const webpackConfig = require('../../webpack.config');
const compiler = Webpack(webpackConfig)
const devMiddleware = WebpackDevMiddleware(compiler, {
  publicPath: webpackConfig.output.publicPath
})

var app = express();


app.use("/static/script", estatic(join(__dirname, "../../public/dist")))
app.use("/static/style", estatic(join(__dirname, "../../public/css")))
app.use("/static/assets", estatic(join(__dirname, "../../public/assets")))

app.get("/", function (req, res, next) {
  res.sendFile(join(__dirname, "../../public/index.html"))
});

app.get("/favicon.ico", (req, res) => {
  res.sendFile(join(__dirname, "../../public/assets/favicon.ico"))
})

app.use("/js", devMiddleware)



app.use((req, res) => {
  res.status(404)
  res.send("KEKEKEEKEKEKEKEKEKEKEKEKEKEKKEKEKEEKEKEKEKKKEEKEKEKKKEKEKE. KEK!")
})

app.listen(8080, () => {
  console.log("Listening!");
});
