// Single source of truth for the free-year voucher offered to fire marshals and
// wildfire recipients. To rotate the code: create a new promotion code in Stripe,
// then change VOUCHER_CODE here (and in src/lib/fireMarshalVoucher.js for the UI).
export const VOUCHER_CODE = 'FIREMARSHAL1YR';

export const VOUCHER_MONTHS = 12;

export const VOUCHER_LABEL = 'Free year for fire marshals & wildfire partners';