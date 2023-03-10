const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const checkEmails = require('./check-emails');

app.use(express.static('public'));

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

checkEmails();
setInterval(checkEmails, Math.floor(Math.random() * 76001) + 45000);
