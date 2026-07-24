import { createCoreServices } from '@trailblazers/core';
import { db } from './db';

export const services = createCoreServices(db);
