export function createProductPayload(values) {
  return {
    ...values,
    images: values.image ? [values.image] : [],
  };
}
