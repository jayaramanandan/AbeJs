
        
    <div data-component-id="0">
    const express = require("express"); const path = require("path"); const app
    = express();

    
    <div data-component-id="NaN">
    app.get("/", (_req, res) => { res.sendFile(path.join(__dirname,
    "main.html")); });
  </div>
    

    app.listen(5000, () => { console.log("app started on localhost 5000"); });
  </div>
    
      