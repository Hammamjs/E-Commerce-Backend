export const uploadManyImgs = (files) => {
  let imgs = [];
  if (files && files.length) {
    imgs = files.map((file) => file.path);
    return imgs;
  }
};

export const upladOneImg = (file) => {
  if (file) {
    return file.path;
  }
};
