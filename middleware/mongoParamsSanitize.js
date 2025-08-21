import sanitize from 'mongo-sanitize';

const mongoParamsQueries = (req, res, next) => {
  req.params = sanitize(req.params);
  next();
};

export default mongoParamsQueries;
