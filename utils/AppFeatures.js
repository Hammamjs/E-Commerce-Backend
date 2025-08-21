class AppFeatures {
  constructor(mongooseQuery, queryString) {
    this.mongooseQuery = mongooseQuery;
    this.queryString = queryString;
    this.filterQuery = {};
    this.paginationResult = {};
  }

  /**
   * Filters the query based on URL parameters
   * Supports advanced filtering with operators (gt, gte, lt, lte)
   */

  filter() {
    let queryStringObj = { ...this.queryString };
    const excludedQuerys = ['page', 'sort', 'limit', 'fields'];

    // Remove special fields from filter
    excludedQuerys.forEach((field) => delete queryStringObj[field]);

    let queryStr = JSON.stringify(queryStringObj);
    queryStr = queryStr.replace(/\b(lt|lte|gte|gt)\b/, (match) => `$${match}`);

    this.filterQuery = JSON.parse(queryStr);
    this.mongooseQuery = this.mongooseQuery.find(this.filterQuery);
    return this;
  }

  /**
   * Full-text search across multiple fields
   * @param {string[]} searchFields - Fields to search in
   */
  search(searchFields = ['name', 'description']) {
    if (this.queryString.search) {
      const searchRegex = new RegExp(this.queryString.search, 'i');
      const searchCondition = searchRegex.map((field) => ({
        [field]: { $regex: searchRegex },
      }));
      this.filterQuery.$or = searchCondition;
      this.mongooseQuery = this.mongooseQuery.find(this.filterQuery);
    }

    return this;
  }

  /**
   * Paginates the results
   * @param {number} totalDocs - Total documents count (optional)
   */

  paginate(totalDocs = 0) {
    const page = Math.max(1, parseInt(this.queryString.page, 10)) || 1;
    const limit = Math.max(1, parseInt(this.queryString.limit, 10)) || 10;
    const skip = (page - 1) * limit;

    const pagination = {
      currentPage: page,
      limit,
      totalPages: Math.ceil(totalDocs / limit) || 1,
    };

    if (page * limit < totalDocs) {
      pagination.next = page + 1;
    }

    if (skip > 0) {
      pagination.prev = page - 1;
    }

    this.paginationResult = pagination;

    this.mongooseQuery = this.mongooseQuery.find().skip(skip).limit(limit);
    return this;
  }

  /**
   * Sorts the results
   * @param {string} defaultSort - Default sort field (default: '-createdAt')
   */

  sort(defaultSort = '-createdAt') {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.mongooseQuery = this.mongooseQuery.sort(sortBy);
    } else {
      this.mongooseQuery = this.mongooseQuery.sort(defaultSort);
    }
    return this;
  }

  /**
   * Limits the fields returned
   * @param {string[]} excludedFields - Fields to exclude by default
   */

  limitFields(excludedFields = ['__v', 'createdAt', 'updatedAt']) {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      // console.log(includedFields);
      this.mongooseQuery = this.mongooseQuery.select(fields);
    } else {
      this.mongooseQuery = this.mongooseQuery.select(
        excludedFields.map((f) => `-${f}`).join('')
      );
    }
    return this;
  }

  /**
   * Populates referenced documents
   * @param {Object|Object[]} populateOptions - Population options
   */

  populate(populateOptions) {
    if (populateOptions) {
      if (Array.isArray(populateOptions)) {
        populateOptions.map((populate) => {
          this.mongooseQuery.populate(populate);
        });
      } else {
        this.mongooseQuery.populate(populateOptions);
      }
    }
    return this;
  }
  /**
   * Executes the query and returns the results
   */
  async execute() {
    return await this.mongooseQuery.exec();
  }
}

export default AppFeatures;
