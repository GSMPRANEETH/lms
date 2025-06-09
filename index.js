const { request, response } = require("express");
const express = require("express");
const app = require("./app");
const bodyParser = require("body-parser");
app.use(bodyParser.json());

const { Todo } = require("./models");

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
