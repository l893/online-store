const PRODUCT_TITLE_MAX_LENGTH = 200;
const PRODUCT_SLUG_MAX_LENGTH = 120;
const PRODUCT_DESCRIPTION_MAX_LENGTH = 5000;
const PRODUCT_IMAGE_URL_MAX_LENGTH = 2048;

const PRODUCT_STRING_FIELD_MAX_LENGTHS = {
  title: PRODUCT_TITLE_MAX_LENGTH,
  slug: PRODUCT_SLUG_MAX_LENGTH,
  description: PRODUCT_DESCRIPTION_MAX_LENGTH,
};

function getProductFieldsExceedingLengthLimits(productInput) {
  const fieldsExceedingLengthLimits = [];

  Object.entries(PRODUCT_STRING_FIELD_MAX_LENGTHS).forEach(
    ([fieldName, maximumLength]) => {
      if (!Object.prototype.hasOwnProperty.call(productInput, fieldName)) {
        return;
      }

      const fieldValue = productInput[fieldName];

      if (typeof fieldValue === 'string' && fieldValue.length > maximumLength) {
        fieldsExceedingLengthLimits.push(fieldName);
      }
    },
  );

  if (
    Object.prototype.hasOwnProperty.call(productInput, 'images') &&
    Array.isArray(productInput.images) &&
    productInput.images.some(
      (imageUrl) =>
        typeof imageUrl === 'string' &&
        imageUrl.length > PRODUCT_IMAGE_URL_MAX_LENGTH,
    )
  ) {
    fieldsExceedingLengthLimits.push('images');
  }

  return fieldsExceedingLengthLimits;
}

module.exports = {
  PRODUCT_DESCRIPTION_MAX_LENGTH,
  PRODUCT_IMAGE_URL_MAX_LENGTH,
  PRODUCT_SLUG_MAX_LENGTH,
  PRODUCT_TITLE_MAX_LENGTH,
  getProductFieldsExceedingLengthLimits,
};
