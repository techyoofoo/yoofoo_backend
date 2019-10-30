const Hapi = require("hapi")

const server = Hapi.server({
    port: process.env.PORT || 6003,
    host: process.env.IP || "localhost",
    routes: {
      cors: {
        origin: ["*"],
        headers: ["Accept", "Content-Type"],
        additionalHeaders: ["X-Requested-With"]
      }
    }
  });


  export default server