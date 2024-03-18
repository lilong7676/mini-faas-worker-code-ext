// 简单使用 express 托管 www 静态资源
const express = require('express');
const path = require('path');
const app = express();
const port = 9001;

app.use(express.static(path.join(__dirname, 'www')));
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
