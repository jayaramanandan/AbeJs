
    const express = require("express"); const path = require("path"); const app
    = express();

    
    app.get("/", (_req, res) => { res.sendFile(path.join(__dirname,
    "main.html")); });
  

    app.listen(5000, () => { console.log("app started on localhost 5000"); });
  
      