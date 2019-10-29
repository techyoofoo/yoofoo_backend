import { env, mongo, port, ip, apiRoot } from './config'
import mongoose from './services/mongoose'
import server from './services/server'
import routes from '../src/api/routes'


mongoose.connect(mongo.uri, { useFindAndModify: false })
mongoose.Promise = Promise

server.route(routes);

setImmediate(async () => {
    await server.start();
    console.log("Server running on %s", server.info.uri, process.env.PORT);
})

export default server
