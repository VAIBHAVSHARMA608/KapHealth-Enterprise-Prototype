const { z } = require("zod");

const placeOrderSchema = z.object({
  prescriptionId: z.string().length(24),
  items: z
    .array(
      z.object({
        medicineId: z.string().length(24),
        quantity: z.number().min(1).max(50),
      })
    )
    .min(1),
  deliveryAddress: z.object({
    line1: z.string().min(2),
    line2: z.string().optional(),
    city: z.string().min(2),
    state: z.string().min(2),
    pincode: z.string().min(4),
    phone: z.string().min(6),
  }),
  paymentMethod: z.enum(["cod", "online"]),
});

const checkoutCartSchema = z.object({
  deliveryAddress: z.object({
    line1: z.string().min(2),
    line2: z.string().optional(),
    city: z.string().min(2),
    state: z.string().min(2),
    pincode: z.string().min(4),
    phone: z.string().min(6),
  }),
  paymentMethod: z.enum(["cod", "online"]),
});

module.exports = { placeOrderSchema, checkoutCartSchema };
