/**
 * Utility function to safely format currency values
 * Handles null, undefined, strings, and numbers
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || amount === '') {
    return '$0.00';
  }
  
  // Convert to number if it's a string
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Check if it's a valid number
  if (isNaN(numAmount)) {
    return '$0.00';
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(numAmount);
};

/**
 * Utility function to safely calculate percentage change
 */
export const calculatePercentage = (current, previous) => {
  if (previous === 0 || previous === null || previous === undefined) {
    return 0;
  }
  
  const currentNum = typeof current === 'string' ? parseFloat(current) : current;
  const previousNum = typeof previous === 'string' ? parseFloat(previous) : previous;
  
  if (isNaN(currentNum) || isNaN(previousNum)) {
    return 0;
  }
  
  return ((currentNum - previousNum) / previousNum * 100).toFixed(1);
};

/**
 * Utility function to get variance color for displaying positive/negative changes
 */
export const getVarianceColor = (current, previous) => {
  const currentNum = typeof current === 'string' ? parseFloat(current) : current;
  const previousNum = typeof previous === 'string' ? parseFloat(previous) : previous;
  
  if (currentNum > previousNum) return 'text-green-600';
  if (currentNum < previousNum) return 'text-red-600';
  return 'text-gray-600';
};