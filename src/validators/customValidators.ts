// Host-supplied named field validators, keyed by the validator name referenced
// in the FlowX Designer. Each value is a factory that receives the validator's
// configured params and returns the predicate the SDK runs against the field
// value. Return `true` to pass, `false` to fail; when it fails, the error
// message configured on that validator in the Designer is shown.
//
// The keys MUST match the custom validator names defined in the process. A
// field referencing an unregistered name logs `Custom validator <name> not
// found` and is skipped.

// Mirrors the SDK's ValidatorFn contract passed to FlowX.configure({ validators }).
export type ValidatorFn = (...params: string[]) => (value: unknown) => boolean | Promise<boolean>

// Romanian national identification number (CNP): 13 digits, the 13th a control
// digit derived from the first 12 weighted by a fixed key. Sample: 6030423015815.
const CNP_CONTROL_KEY = [2, 7, 9, 1, 4, 6, 3, 5, 8, 2, 7, 9]

const isValidCnp = (cnp: string): boolean => {
  if (!/^\d{13}$/.test(cnp)) return false
  const digits = cnp.split('').map(Number)
  const sum = CNP_CONTROL_KEY.reduce((acc, weight, i) => acc + weight * digits[i], 0)
  const control = sum % 11 === 10 ? 1 : sum % 11
  return control === digits[12]
}

export const customValidators: Record<string, ValidatorFn> = {
  // No params: the field value must be a valid Romanian CNP.
  cnpValidator: () => (value: unknown) => isValidCnp(String(value ?? '')),

  // Params come from the validator config in the Designer.
  minLength: (min: string) => (value: unknown) => String(value ?? '').length >= Number(min),
}
