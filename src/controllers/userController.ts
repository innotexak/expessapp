import { Response, Request, NextFunction, CookieOptions } from 'express'
import GeneralService from "../services/generalService.js";
import { IActivate, IChangeP, ILogin, IRegistration, IReset } from "../validation/userValidation.js";
import __AccountRepo from '../models/userSchema.js'
import Utils from '../helpers/utils.js';
import CustomError from '../helpers/errorHandler.js';
import EmailService from '../services/emailService.js';


const cookieSettings = {
    httpOnly: true,
    secure: false,
} satisfies CookieOptions;

const utilsService = new Utils()

class UserController extends GeneralService {

    async userRegistration(req: Request, res: Response, next: NextFunction) {
        const payload: IRegistration = req.body
        const hashPassword = await new Utils().hashPassword(payload.password)
        try {
            const userData = await __AccountRepo.findOne({ email: payload.email })
            if (userData) throw CustomError.BadRequestError("User already exist")

            const { email } = payload
            const emailInstance = EmailService.getInstance()
            const otp = utilsService.generateOtp()
            const sentEmail = await emailInstance.sendMail(email, 'Welcome', 'welcome', { otp, year: new Date().getFullYear() })

            if (sentEmail) {
                const created = await this.handleMongoError(__AccountRepo.create({ ...payload, password: hashPassword, otp }))
                res.status(201).json({ message: "Success, check your mail for activation otp", data: { timeAllowed: 30 + "mins", userId: created._id, }, statusCode: 201 })
            } else {
                throw CustomError.ValidationError("Unable to signup please try again")
            }

        } catch (error) {
            throw CustomError.ConflictError(error as string)
        }

    }


    async handleGoogleAuth(user: { email: string, avatar: string, lastName: string, firstName: string }, res: Response) {

        const token = await utilsService.generateToken({ email: user.email, role: "USER" })
        const userData = await __AccountRepo.findOne({ email: user.email })
        if (userData) {
            //login user
            res.cookie('ay-token', token, cookieSettings)

        } else {
            //create account
            const hashPassword = await utilsService.hashPassword('google')
            await this.handleMongoError(__AccountRepo.create({ ...user, password: hashPassword, channelUsed: "GOOGLE" }))
            res.cookie('ay-token', token, cookieSettings)

        }

    }

    async userLogin(req: Request, res: Response, next: NextFunction) {

        const user: ILogin = req.body
        const utilsService = new Utils()

        const userData = await __AccountRepo.findOne({ email: user.email })

        if (!userData) throw CustomError.BadRequestError("Invalid login credentials")

        if (!userData.emailVerifiedAt) throw CustomError.BadRequestError("Account not activated, please check your mail for otp")

        const isPassword = await utilsService.isMatchPassword(userData.password, user.password)

        if (!isPassword) throw CustomError.BadRequestError("Invalid login credentials")
        const token: string = await utilsService.generateToken({ email: user.email, role: userData.role })
        const data = {
            firstName: userData.firstName,
            lastName: userData.lastName,
            phone: userData.phone,
            email: userData.email,
            emailVerifiedAt: userData.emailVerifiedAt,
            role: userData.role,
            lastLogin: userData.lastLogin,
            avatar: userData.avatar,
            channel: userData.channelUsed
        }

        if (token) {
            res.cookie('ay-token', token, cookieSettings)
            await __AccountRepo.findByIdAndUpdate(userData._id, { lastLogin: new Date() })
            res.status(200).json({ message: "Login successful", statusCode: 200, data })
        } else {
            res.status(400).json({ message: "Unable to login, please try again", statusCode: 400 })
        }

    }

    async activateAccount(req: Request, res: Response, next: NextFunction) {
        const user: IActivate = req.body

        const { userId, otp } = user

        const userData: any = await __AccountRepo.findOne({ _id: userId, otp })

        if (!userData) throw CustomError.BadRequestError("Invalid login credentials")
        const currentTime = new Date().getMinutes()
        const optTime = new Date(userData.createdAt).getMinutes()
        const timeDifference = currentTime - optTime;

        const maxAllowedDifference = 30;

        if (timeDifference <= maxAllowedDifference) {

            await __AccountRepo.updateOne({ _id: userId }, { emailVerifiedAt: new Date(), otp: null })
            res.status(200).json({ message: "Account activation complete", statusCode: 200 })
        } else {
            res.status(400).json({ message: "Invalid or expired otp", statusCode: 400, retry: true })
        }

    }

    async userResetPasswordOtp(req: Request, res: Response, next: NextFunction) {
        const user: ILogin = req.body
        const utilsService = new Utils()

        const userData = await __AccountRepo.findOne({ email: user.email })

        if (!userData) throw CustomError.BadRequestError("No record found, kindly sign up")
        try {
            const { email } = userData
            const emailInstance = EmailService.getInstance()
            const otp = utilsService.generateOtp()
            const sentEmail = await emailInstance.sendMail(email, 'Password Reset', 'reset-password', { otp, year: new Date().getFullYear() })
            if (sentEmail) {
                await __AccountRepo.findByIdAndUpdate(userData._id, { otp })
                res.status(200).json({
                    message: "Reset mail sent, kindly input the provided OTP",
                    statusCode: 200,
                    data: {
                        timeAllowed: 30 + "mins",
                        userId: userData._id
                    }
                })
            }
        } catch (error) {
            throw CustomError.ConflictError(error as string)
        }
    }

    async resetPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const user: IReset = req.body

            const { userId, otp, password } = user

            const userData: any = await __AccountRepo.findOne({ _id: userId, otp })

            if (!userData) throw CustomError.BadRequestError("Invalid process, please try again")
            const currentTime = new Date().getMinutes()
            const optTime = new Date(userData.updatedAt).getMinutes()
            const timeDifference = currentTime - optTime;

            const maxAllowedDifference = 30;

            if (timeDifference <= maxAllowedDifference) {
                const hashPassword = await utilsService.hashPassword(password)

                const isEmailActivated = !userData.emailVerifiedAt ? new Date() : userData.emailVerifiedAt

                await __AccountRepo.updateOne({ _id: userId }, {
                    password: hashPassword,
                    emailVerifiedAt: isEmailActivated,
                    otp: null
                })
                res.status(200).json({ message: "Password reset complete, kindly login", statusCode: 200 })
            } else {
                res.status(400).json({ message: "Invalid or expired otp", statusCode: 400, retry: true })
            }
        } catch (error: any) {
            throw CustomError.BadRequestError(error as any)

        }
    }

    async changePassword(req: Request, res: Response, next: NextFunction) {

        try {
            const user: IChangeP = req.body
            const userData: any = req.user

            if (!userData) throw CustomError.BadRequestError("Expired or Invalid Session")

            const profile: any = await __AccountRepo.findOne({ email: userData.email })
            const isPassword = await utilsService.isMatchPassword(profile.password, user.oldPassword)

            if (!isPassword) throw CustomError.BadRequestError("Expired or Invalid Session")
            const hashedPassword = await utilsService.hashPassword(user.newPassword)

            const updated = await __AccountRepo.updateOne({ email: userData.email }, { password: hashedPassword })

            if (updated.matchedCount > 0) {
                res.status(200).json({ message: "Password update complete", statusCode: 200 })
            } else {
                res.status(400).json({ message: "Unable to login, please try again", statusCode: 400 })
            }
        } catch (error) {
            throw CustomError.ConflictError(error as string)
        }

    }
}

export default UserController