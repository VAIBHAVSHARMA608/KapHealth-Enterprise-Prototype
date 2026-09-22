/** Wraps a zod schema into an Express middleware that validates req.body. */
function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      const firstError = Object.values(fieldErrors).flat()[0];
      return res.status(400).json({
        message: firstError || "Validation failed",
        errors: fieldErrors,
      });
    }
    req.body = result.data;
    next();
  };
}

module.exports = { validateBody };
