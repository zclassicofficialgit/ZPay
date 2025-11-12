// @flow

import { BigNumber } from 'bignumber.js';

export type ValidationResult = {
  isValid: boolean,
  error: string | null,
};

/**
 * Validates transaction amount
 * @param {string} amount - Amount to validate
 * @param {number} balance - Current balance
 * @returns {ValidationResult}
 */
export const validateAmount = (
  amount: string,
  balance: number,
): ValidationResult => {
  // Check if amount is empty
  if (!amount || amount.trim() === '') {
    return {
      isValid: false,
      error: 'Amount is required',
    };
  }

  // Check if amount is a valid number
  const amountBN = new BigNumber(amount);

  if (amountBN.isNaN()) {
    return {
      isValid: false,
      error: 'Amount must be a valid number',
    };
  }

  // Check if amount is positive
  if (amountBN.isLessThanOrEqualTo(0)) {
    return {
      isValid: false,
      error: 'Amount must be greater than zero',
    };
  }

  // Check if amount exceeds balance
  if (amountBN.isGreaterThan(balance)) {
    return {
      isValid: false,
      error: 'Amount exceeds available balance',
    };
  }

  // Check for reasonable precision (max 8 decimal places for ZCL)
  const decimalPlaces = (amount.split('.')[1] || '').length;
  if (decimalPlaces > 8) {
    return {
      isValid: false,
      error: 'Amount cannot have more than 8 decimal places',
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

/**
 * Validates transaction fee
 * @param {string|number} fee - Fee to validate
 * @returns {ValidationResult}
 */
export const validateFee = (fee: string | number): ValidationResult => {
  const feeBN = new BigNumber(fee);

  if (feeBN.isNaN()) {
    return {
      isValid: false,
      error: 'Fee must be a valid number',
    };
  }

  if (feeBN.isNegative()) {
    return {
      isValid: false,
      error: 'Fee cannot be negative',
    };
  }

  // Max fee check (prevent accidental huge fees)
  if (feeBN.isGreaterThan(1)) {
    return {
      isValid: false,
      error: 'Fee seems unusually high. Maximum fee is 1 ZCL',
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

/**
 * Validates recipient address format
 * @param {string} address - Address to validate
 * @returns {ValidationResult}
 */
export const validateAddressFormat = (address: string): ValidationResult => {
  if (!address || address.trim() === '') {
    return {
      isValid: false,
      error: 'Address is required',
    };
  }

  // Basic format validation for Zclassic addresses
  // Transparent addresses start with 't1' or 't3'
  // Shielded addresses start with 'zc'
  const isTransparent = address.startsWith('t1') || address.startsWith('t3');
  const isShielded = address.startsWith('zc');

  if (!isTransparent && !isShielded) {
    return {
      isValid: false,
      error: 'Invalid address format. Address must start with t1, t3, or zc',
    };
  }

  // Check minimum length
  if (address.length < 35) {
    return {
      isValid: false,
      error: 'Address is too short',
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

/**
 * Validates memo field
 * @param {string} memo - Memo to validate
 * @returns {ValidationResult}
 */
export const validateMemo = (memo: string): ValidationResult => {
  if (!memo) {
    return {
      isValid: true,
      error: null,
    };
  }

  // Max memo size in bytes (512 bytes for Zcash-based coins)
  const memoBytes = new TextEncoder().encode(memo).length;
  if (memoBytes > 512) {
    return {
      isValid: false,
      error: `Memo is too long (${memoBytes} bytes). Maximum is 512 bytes`,
    };
  }

  return {
    isValid: true,
    error: null,
  };
};
