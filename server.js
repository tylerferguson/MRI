var express = require("express");
var proxy = require("express-http-proxy");
var url = require("url");
var app = express();

app.use("/office365", proxy("https://outlook.office365.com", {
    forwardPath: function(req, res) {
    return "/api/v1.0" + req.url;
}
}));
app.use(express.static(__dirname));

app.listen(8080);