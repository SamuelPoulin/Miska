import { Container } from "inversify";

import TYPES from "./types";
import Miska from "../miska";
import SoundbiteService from "../services/soundbite-service";
import DatabaseService from "../services/database-service";

const container = new Container();

container.bind(TYPES.Miska).to(Miska);
container.bind(TYPES.SoundbiteService).to(SoundbiteService);
container.bind(TYPES.DatabaseService).to(DatabaseService);

export default container;
