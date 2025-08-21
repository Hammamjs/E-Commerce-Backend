import sanitize from 'mongo-sanitize';

const mongoBodyQueries = (req, res, next) => {
  req.body = sanitize(req.body);
  next();
};

export default mongoBodyQueries;
