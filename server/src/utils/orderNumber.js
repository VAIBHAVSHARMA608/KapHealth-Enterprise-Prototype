const { customAlphabet } = require("nanoid");
const nanoid = customAlphabet("0123456789", 6);

function generateOrderNumber() {
  const year = new Date().getFullYear();
  return `KAP-${year}-${nanoid()}`;
}

function generateLabBookingNumber() {
  const year = new Date().getFullYear();
  return `KAP-LAB-${year}-${nanoid()}`;
}

module.exports = { generateOrderNumber, generateLabBookingNumber };
