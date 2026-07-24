import { createCoreServices } from '@trailblazers/core';
import { db } from './db.js';

export const services = createCoreServices(db);
