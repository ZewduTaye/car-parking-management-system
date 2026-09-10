const validateRequiredFields = (fields, data) => {
  const missingFields = fields.filter(
    (field) =>
      data[field] === undefined ||
      data[field] === null ||
      data[field] === ""
  );

  return missingFields;
};

module.exports = {
  validateRequiredFields,
};