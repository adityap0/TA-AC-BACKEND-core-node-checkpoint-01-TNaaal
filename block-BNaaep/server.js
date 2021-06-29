let http = require("http");
let url = require("url");
let fs = require("fs");
let qs = require("querystring");
let contactPath = __dirname + "/contacts/";
let server = http.createServer((req, res) => {
  let store = "";
  req.on("data", (chunk) => {
    store += chunk;
  });
  req.on("end", () => {
    let parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;
    if (req.method === "GET" && pathname === "/") {
      fs.createReadStream("./index.html").pipe(res);
    } else if (req.method === "GET" && pathname.includes(".css")) {
      res.setHeader("Content-Type", "text/css");
      fs.createReadStream(__dirname + req.url).pipe(res);
    } else if (req.method === "GET" && pathname.includes(".png")) {
      res.setHeader("Content-Type", "image/png");
      fs.createReadStream(__dirname + req.url).pipe(res);
    } else if (req.method === "GET" && pathname === "/about") {
      fs.createReadStream("./about.html").pipe(res);
    } else if (req.method === "GET" && pathname === "/contact") {
      fs.createReadStream("./contact.html").pipe(res);
    } else if (req.method === "POST" && pathname === "/form") {
      let parsedData = qs.parse(store);
      store = JSON.stringify(parsedData);
      let username = parsedData.username.toLowerCase();
      fs.open(contactPath + username + ".json", "wx", (error, fd) => {
        if (error) {
          return console.log(`Username already taken!!`);
        }
        fs.writeFile(fd, store, (error) => {
          if (error) {
            return console.log(error);
          }
          fs.close(fd, () => {
            res.end(`${parsedData.name} contact saved!`);
          });
        });
      });
    } else if (req.method === "GET" && pathname === "/users") {
      if (req.url === "/users") {
        res.setHeader("Content-Type", "text/html");
        fs.readdir(contactPath, (err, content) => {
          content.forEach((item, id) => {
            fs.readFile(contactPath + item, (error, contentx) => {
              let fcontent = JSON.parse(contentx.toString());
              store +=
                `<h1>${fcontent.name}</h1>` +
                `<h1>${fcontent.email}</h1>` +
                `<h1>${fcontent.username}</h1>` +
                `<h1>${fcontent.age}</h1>` +
                `<h1>${fcontent.about}</h1>`;
              if (id === content.length - 1) {
                res.end(store);
              }
            });
          });
        });
      } else {
        // http://localhost:5000/users?username=suraj
        let parsedUrl = url.parse(req.url);
        let username = qs.parse(parsedUrl.query);
        let name = username.username;
        fs.readFile(contactPath + name + ".json", (error, content) => {
          if (error) {
            return console.log(error);
          }
          let fcontent = JSON.parse(content.toString());
          res.setHeader("Content-Type", "text/html");
          res.write(`<h1>${fcontent.name}</h1>`);
          res.write(` <h1>${fcontent.email}</h1>`);
          res.write(`<h1>${fcontent.username}</h1>`);
          res.write(`<h1>${fcontent.age}</h1>`);
          res.write(`<h1>${fcontent.about}</h1>`);
          return res.end();
        });
      }
    }
  });
});
server.listen(5000, () => {
  console.log(`5000 : Activated...`);
});
