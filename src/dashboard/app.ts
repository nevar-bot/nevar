/*-- https://github.com/geshan/expressjs-structure/blob/master/index.js --*/
/*-- https://stackoverflow.com/questions/74976480/discord-oauth2-with-node-js --*/

import express, {Express} from 'express';
import bodyParser from "body-parser";
import BaseClient from "@structures/BaseClient";
import path from "path";
import cookieParser from "cookie-parser";

import IndexRoute from "@dashboard/routes/IndexRoute";
import DashboardRoute from "@dashboard/routes/DashboardRoute";
import AuthRoute from "@dashboard/routes/AuthRoute";


export default {
    init(client: BaseClient): void {
        const app = express();

        app.set("view engine", "pug");
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(cookieParser());

        /* set routes */
        app.use("/", IndexRoute);
        app.use("/dashboard", DashboardRoute);
        app.use("/auth", AuthRoute);

        app.set("views", path.join(__dirname, "views"));
        app.use(express.static(path.join(__dirname, "public")));
        app.listen(3000,  (): void => {
            client.logger.success("Dashboard listening on port 3000");
        })
    }
}