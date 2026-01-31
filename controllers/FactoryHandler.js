import AsyncHandler from 'express-async-handler';
import AppError from '../utils/AppError.js';
import AppFeatures from '../utils/AppFeatures.js';
import { getIo } from '../utils/socket.js';

const ERRORS_MESSAGE = {
  NOT_FOUND: (model) => `${model} not found.`,
  CREATE_FAILED: (model) => `Failed to create ${model}`,
  UPDATE_FAILED: (model) => `Failed to update ${model}`,
  ADMIN_DELETE: 'Admin users cannot be deleted',
  INVALID_ID: 'Invalid document ID',
};

const DEFAULT_POPULATE_OPTIONS = {
  path: '',
  select: '-__v -createdAt: -updatedAt',
};

export const addIdParamToBody = async (req, res, next) => {
  if (!req.body.user || req.user?._id) req.body.user = req.user._id;
  next();
};

export const createFilterObj = async (req, res, next) => {
  const filter = {};
  if (req.params.userId) filter.user = req.params.userId;
  if (req?.user?._id && req.user.role !== 'ADMIN') filter.user = req.user._id;
  req.filterObj = filter;
  next();
};

export const setProductFilter = (req, res, next) => {
  if (req.params.productId) {
    req.filterObj = { product: req.params.productId };
  }
  next();
};

export const getAll = (Model, populationOptions = DEFAULT_POPULATE_OPTIONS) =>
  AsyncHandler(async (req, res, next) => {
    const modelName = Model.modelName;
    const baseQuery = Model.find(req.filterObj || {}).lean();

    const features = new AppFeatures(baseQuery, req.query)
      .search()
      .filter()
      .sort()
      .paginate(await Model.countDocuments())
      .limitFields();

    if (populationOptions) {
      if (Array.isArray(populationOptions)) {
        for (const option of populationOptions) {
          features.mongooseQuery = features.mongooseQuery.populate(option);
        }
      } else if (populationOptions.path)
        features.mongooseQuery =
          features.mongooseQuery.populate(populationOptions);
    }

    const documents = await features.mongooseQuery;

    res.status(200).json({
      data: documents,
      pagination: features.paginationResult,
    });
  });

export const getOne = (Model, populationOptions = DEFAULT_POPULATE_OPTIONS) =>
  AsyncHandler(async (req, res, next) => {
    const modelName = Model.modelName;
    const query = Model.findById(req.params.id);

    if (populationOptions.path) {
      query = query.populate(populationOptions);
    }

    const document = await query;
    if (!document)
      return next(new AppError(404, ERRORS_MESSAGE.NOT_FOUND(modelName)));

    res.status(200).json({ data: document });
  });

export const createOne = (Model, eventName = 'docCreated') =>
  AsyncHandler(async (req, res, next) => {
    // upload Many Images
    const modelName = Model.modelName;
    const document = await Model.create(req.body);

    if (!document)
      return next(new AppError(400, ERRORS_MESSAGE.CREATE_FAILED(modelName)));

    if (eventName) {
      getIo().emit(eventName, document);
    }

    res.status(201).json({ message: 'created', document });
  });

export const updateOne = (
  Model,
  { eventName = 'docUopdated', excludedFields = ['password', 'role'] } = {},
) =>
  AsyncHandler(async (req, res, next) => {
    const updateData = { ...req.body };

    // Remove exclude fileds
    excludedFields.forEach((field) => delete updateData[field]);

    // for multi imgs

    if (req.files) {
      updateData.images = req.filesWebp;
    }

    if (req.file) {
      updateData.image = req.file.webpath;
    }

    const document = await Model.findByIdAndUpdate(
      req.params.id || req.user.id,
      updateData,
      {
        new: true,
        runValidator: true,
      },
    );

    if (!document) return next(new AppError(404, ERRORS_MESSAGE.INVALID_ID));

    if (eventName) {
      getIo().emit(eventName, document);
    }

    res.status(200).json({ message: 'updated!', document });
  });

export const deleteOne = (Model, eventName = 'docDeleted') =>
  AsyncHandler(async (req, res, next) => {
    const modelName = Model.modelName;
    const documentId = req.params.id;

    console.log(documentId);

    if (!documentId) return next(new AppError(400, ERRORS_MESSAGE.INVALID_ID));

    const document = await Model.findOneAndDelete({
      _id: documentId,
    });

    if (!document)
      return next(new AppError(404, ERRORS_MESSAGE.NOT_FOUND(modelName)));

    if (document.role === 'Admin')
      return next(new AppError(404, ERRORS_MESSAGE.ADMIN_DELETE));

    if (eventName) {
      getIo().emit(eventName, document);
    }

    res.sendStatus(204);
  });

// Update order status
export const updateOrderStatus = (Model, status) =>
  AsyncHandler(async (req, res) => {
    const orderId = req.body.orderId;

    if (!orderId) return next(new AppError(400, 'Order ID is required'));

    if (!['pending', 'delivered', 'shipped'].includes(status))
      throw new AppError(400, 'Invalid status');

    const order = await Model.findOneAndUpdate(
      { _id: orderId },
      { status },
      { new: true },
    );
    res.status(200).json({ message: 'Order status updated', order });
  });
