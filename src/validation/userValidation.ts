import CustomError from "../helpers/errorHandler.js"

export interface IRegistration {
  firstName: string
  email: string
  lastName: string
  password: string
  role: 'SUPERADMIN' | "STAFF" | 'USER'
}

export interface ILogin {
  email: string
  password: string

}

export interface IActivate {
  userId: string
  otp: number

}

export interface IReset {
  userId: string
  otp: number
  password: string
}

export interface IChangeP {
  oldPassword: string
  newPassword: string

}

export function ValidateRegistation(user: IRegistration) {
  let error: { error: boolean, message: string } = { message: "", error: false }
  // Validate email
  if (!user.email || typeof user.email !== 'string' || !isValidEmail(user.email)) {
    error.message = 'Invalid email address';
    error.error = true
  }

  // Validate role
  if (!user.role || !['SUPERADMIN', 'STAFF', 'USER'].includes(user.role)) {
    error.message = 'Invalid role'
    error.error = true
  }

  // Validate firstName
  if (!user.firstName || typeof user.firstName !== 'string') {
    error.message = 'First name is required'
    error.error = true
  }

  // Validate lastName
  if (!user.lastName || typeof user.lastName !== 'string') {
    error.message = 'Last name is required';
    error.error = true
  }

  // Validate password
  if (!user.password || typeof user.password !== 'string') {
    error.error = true
    error.message = 'Password is required'
  }

  if (!isStrongPassword(user.password)) {
    error.error = true
    error.message = 'Password should '
  }
  return error
}

function isStrongPassword(password: string) {
  // Check if the password meets the criteria for a strong password
  // You can customize these criteria based on your requirements

  const minLength = 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return (
    password.length >= minLength &&
    hasUppercase &&
    hasLowercase &&
    hasDigit &&
    hasSpecialChar
  );
}

function isValidEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function ValidationLogin(user: ILogin) {

  let error: { error: boolean, message: string } = { message: "", error: false }
  // Validate email
  if (!user.email || typeof user.email !== 'string' || !isValidEmail(user.email)) {
    error.message = 'Invalid email address';
    error.error = true
  }

  // Validate password
  if (!user.password || typeof user.password !== 'string') {
    error.error = true
    error.message = 'Password is required'
  }

  if (!isStrongPassword(user.password)) {
    error.error = true
    error.message = 'Password should be strong, include uppercase, number and special character'
  }
  return error
}

export function ValidationActivate(user: IActivate) {

  let error: { error: boolean, message: string } = { message: "", error: false }
  // Validate email
  if (!user.userId || typeof user.userId !== 'string') {
    error.message = 'Invalid user session';
    error.error = true
  }

  // Validate OTP
  if (!user.otp || typeof user.otp !== 'number') {
    error.error = true
    error.message = 'Otp is required'
  }


  return error
}

export function ValidationReset({ otp, userId, password }: IReset) {

  let error: { error: boolean, message: string } = { message: "", error: false }
  // Validate email
  if (!userId || typeof userId !== 'string') {
    error.message = 'Invalid user session';
    error.error = true
  }

  // Validate password
  if (!password || typeof password !== 'string') {
    error.error = true
    error.message = 'Password is required'
  }

  if (!isStrongPassword(password)) {
    error.error = true
    error.message = 'New password should be strong, include uppercase, number and special character'
  }


  // Validate OTP
  if (!otp || typeof otp !== 'number') {
    error.error = true
    error.message = 'Otp is required'
  }

  return error
}

export function ValidateChangePassword({ oldPassword, newPassword }: IChangeP) {

  let error: { error: boolean, message: string } = { message: "", error: false }
  // Validate password
  if (!newPassword || typeof newPassword !== 'string') {
    error.error = true
    error.message = 'Password is required'
  }

  if (!isStrongPassword(newPassword)) {
    error.error = true
    error.message = 'New password should be strong, include uppercase, number and special character'
  }
  return error

}

export function ValidateEmail({ email }: { email: string }) {
  let error: { error: boolean, message: string } = { message: "", error: false }
  // Validate email
  if (!email || typeof email !== 'string' || !isValidEmail(email)) {
    error.message = 'Invalid email address';
    error.error = true
  }

  return error
}