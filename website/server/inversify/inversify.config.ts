import { Container } from "inversify";

import TYPES from "./types";
import Miska from "../miska";
import FlashbackService from "../services/flashback-service";
import SoundbiteService from "../services/soundbite-service";
import DatabaseService from "../services/database-service";
import CommandService from "../services/command-service";

const container = new Container();

container.bind(TYPES.Miska).to(Miska);
container.bind(TYPES.FlashbackService).to(FlashbackService);
container.bind(TYPES.SoundbiteService).to(SoundbiteService);
container.bind(TYPES.DatabaseService).to(DatabaseService);
container.bind(TYPES.CommandService).to(CommandService);

export default container;
