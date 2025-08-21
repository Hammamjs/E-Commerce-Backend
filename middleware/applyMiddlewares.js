import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { json, urlencoded } from 'express';
import mongoBodyQueries from './mongoBodySanitize.js';
import { corsOptions } from '../config/index.js';
import { sanitizeInput } from './SanitizeData.js';
import mongoParamsQueries from './mongoParamsSanitize.js';

const applyMiddelwares = (app) => {
  // # __dirname and __filename not support by default in type module
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  app.use(cors(corsOptions));
  // Cookie parser
  app.use(cookieParser());

  app.use(urlencoded({ extended: true }));

  // for parse json body
  app.use(json({ limit: '10kb' }));

  // enable static files
  app.use(express.static(path.join(__dirname, 'public')));
  app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

  // security

  // Sanitize data
  app.use(sanitizeInput);
  // sanitize mongo Queries
  app.use(mongoBodyQueries);
  // sanitize mongo params
  app.use(mongoParamsQueries);
};

export default applyMiddelwares;
