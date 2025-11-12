// @flow

export const formatNumber = ({ value, append = '' }: { value: number, append?: string }) => (
  // Force en-US locale: dot (.) for decimal, comma (,) for thousands
  `${append}${(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 8,
  })}`
);
