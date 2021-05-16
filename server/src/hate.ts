import 'reflect-metadata';

import dotenv from 'dotenv';
dotenv.config();

import Miska from './miska';
import container from './inversify/inversify.config';
import TYPES from './inversify/types';

const miska: Miska = container.get<Miska>(TYPES.Miska);
miska.start();
