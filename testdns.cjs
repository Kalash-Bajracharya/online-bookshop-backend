const dns = require("dns");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

dns.resolveSrv(
  "_mongodb._tcp.firstdatabase.zmlqhxy.mongodb.net",
  (err, addresses) => {
    if (err) {
      console.error("DNS ERROR:", err);
    } else {
      console.log("DNS SUCCESS:");
      console.log(addresses);
    }
  }
);