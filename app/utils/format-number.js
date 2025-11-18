// @flow

export const formatNumber = ({
  value,
  append = '',
  maxDecimals = 8
}: {
  value: number,
  append?: string,
  maxDecimals?: number
}) => {
  // Convert to number and handle invalid values
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  const safeValue = isNaN(numValue) ? 0 : numValue;

  // Force en-US locale: dot (.) for decimal, comma (,) for thousands
  return `${append}${safeValue.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  })}`;
};
