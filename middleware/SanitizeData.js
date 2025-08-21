import sanitize from 'mongo-sanitize';
import { JSDOM } from 'jsdom';
import domPurify from 'dompurify';

const window = new JSDOM('').window;
const DOMPurify = domPurify(window);

export const sanitizeInput = (req, res, next) => {
  const sanitizeData = (data) => {
    if (!data) return data;
    if (typeof data === 'object') {
      return Object.entries(data).reduce((acc, [key, value]) => {
        acc[key] = sanitizeData(value);
        return acc;
      }, {});
    }
    if (typeof data === 'string') {
      return DOMPurify.sanitize(sanitize(data));
    }
    return data;
  };
  req.body = sanitize(req.body);
  req.params = sanitize(req.params);
  req.query = sanitize(req.query);
  next();
};
