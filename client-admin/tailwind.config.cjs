/** Admin console uses plain Tailwind defaults (slate/emerald) -- admin
 * pages never used the patient app's custom warm/glass design tokens, so
 * no theme extension is needed here. */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: { extend: {} },
  plugins: [],
};
