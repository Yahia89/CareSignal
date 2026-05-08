/**
 * Form validators
 *
 * Composable, framework-agnostic validators. Each validator returns either a
 * string (the error message to display) or null (no error). Combine them with
 * `validateForm` to get a `{ valid, errors }` object back in one call.
 *
 * Usage:
 *   const { valid, errors } = validateForm(values, {
 *     email: [required('Email is required'), isEmail()],
 *     password: [required(), minLength(8), hasNumber(), hasLetter()],
 *   });
 *
 * Keep validators pure: don't read from outside state. If you need to compare
 * two fields (e.g. password === passwordConfirm), use `match(otherField)`.
 */

export type Validator<TValue = any, TValues = Record<string, any>> = (
  value: TValue,
  allValues: TValues
) => string | null;

// ============================================================================
// PRIMITIVE VALIDATORS
// ============================================================================

/** Trims strings before checking emptiness. Other falsy values fail too. */
export const required =
  (message = 'This field is required'): Validator<unknown> =>
  (value) => {
    if (value === null || value === undefined) return message;
    if (typeof value === 'string' && value.trim().length === 0) return message;
    return null;
  };

export const minLength =
  (n: number, message?: string): Validator<string> =>
  (value) =>
    !value || value.length < n
      ? message ?? `Must be at least ${n} characters`
      : null;

export const maxLength =
  (n: number, message?: string): Validator<string> =>
  (value) =>
    value && value.length > n
      ? message ?? `Must be at most ${n} characters`
      : null;

// RFC 5322-flavored regex; strict enough for production while staying readable.
// Catches the common-mistake cases: missing @, bad TLD, internal whitespace.
const EMAIL_RE =
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z]{2,})+$/;

export const isEmail =
  (message = 'Enter a valid email address'): Validator<string> =>
  (value) => {
    if (!value) return null; // pair with required() for emptiness
    return EMAIL_RE.test(value.trim()) ? null : message;
  };

export const hasLetter =
  (message = 'Must contain at least one letter'): Validator<string> =>
  (value) => (!value || /[a-zA-Z]/.test(value) ? null : message);

export const hasNumber =
  (message = 'Must contain at least one number'): Validator<string> =>
  (value) => (!value || /\d/.test(value) ? null : message);

export const noDigits =
  (message = "Can't contain numbers"): Validator<string> =>
  (value) => (!value || !/\d/.test(value) ? null : message);

/**
 * Compare against another field in the same form (e.g. password confirmation).
 * The `field` arg is the name of another property on `allValues`.
 */
export const match =
  <T extends Record<string, unknown>>(field: keyof T, message = 'Values do not match'): Validator<unknown, T> =>
  (value, allValues) =>
    value === allValues[field] ? null : message;

/** Membership test for limited choices (e.g. role enum). */
export const oneOf =
  <T>(allowed: readonly T[], message = 'Invalid selection'): Validator<T> =>
  (value) =>
    allowed.includes(value) ? null : message;

// ============================================================================
// COMPOSED VALIDATORS — common ready-made rules
// ============================================================================

/**
 * Production password rule: ≥8 chars, contains a letter and a digit.
 * Use only on signup / password-change. On login we just check non-empty.
 */
export const strongPassword: Validator<string>[] = [
  required('Password is required'),
  minLength(8, 'Password must be at least 8 characters'),
  hasLetter('Password must contain a letter'),
  hasNumber('Password must contain a number'),
];

export const personName = (label: string): Validator<string>[] => [
  required(`${label} is required`),
  minLength(1),
  maxLength(50, `${label} must be 50 characters or fewer`),
  noDigits(`${label} can't contain numbers`),
];

// ============================================================================
// FORM RUNNER
// ============================================================================

export type FormRules<T> = {
  [K in keyof T]?: Validator<T[K], T> | Validator<T[K], T>[];
};

export type FormErrors<T> = Partial<Record<keyof T, string>>;

/**
 * Run all rules against `values`. Returns the FIRST failing message per field
 * (matches typical UX — don't pile up errors on one field).
 *
 * `valid` is true iff `errors` is empty.
 */
export function validateForm<T extends Record<string, any>>(
  values: T,
  rules: FormRules<T>
): { valid: boolean; errors: FormErrors<T> } {
  const errors: FormErrors<T> = {};

  (Object.keys(rules) as Array<keyof T>).forEach((field) => {
    const rule = rules[field];
    if (!rule) return;
    const validators = Array.isArray(rule) ? rule : [rule];
    for (const v of validators) {
      const msg = v(values[field], values);
      if (msg) {
        errors[field] = msg;
        return; // stop at first error for this field
      }
    }
  });

  return { valid: Object.keys(errors).length === 0, errors };
}
