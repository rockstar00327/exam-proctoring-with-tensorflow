const isEmpty = (value) => {
  // Check for null or undefined
  if (value == null) return true;

  // Handle numbers, booleans, and NaN
  if (typeof value === 'number') return Number.isNaN(value); // Treat NaN as empty
  if (typeof value === 'boolean') return false;

  // Handle strings
  if (typeof value === 'string' && value.trim() === '') return true;

  // Handle arrays
  if (Array.isArray(value) && value.length === 0) return true;

  // Handle objects
  if (value !== null && typeof value === 'object' && Object.keys(value).length === 0) return true;

  return false;
};

export { isEmpty };