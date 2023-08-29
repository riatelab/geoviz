/**
 * Check if value is a number or can be correctly converted to a finite number.
 * As such it returns false if value is null or undefined,
 * if it's a string, even an empty string (casting empty string to number gives 0),
 * if it's a boolean (casting them to number gives 0 or 1) or if it's NaN, Infinity or -Infinity.
 * It returns true for numbers and strings containing numbers (even with leading or trailing spaces).
 *
 * @param {any} value - The value to test.
 * @returns {boolean} - True if value is a number or can be converted to a finite number, false otherwise.
 */
export function isNumber(value) {
  return (
    value !== null &&
    value !== "" &&
    typeof value !== "boolean" &&
    isFinite(value)
  );
}
