import express, { Request, NextFunction, Response } from 'express'
import { AuthMiddleware } from '../helpers/middleware.js'
import UserController from '../controllers/userController.js'
import CustomError from '../helpers/errorHandler.js'
import { ValidateRegistation, ValidationLogin, ValidateEmail, ValidateChangePassword, ValidationActivate, ValidationReset } from '../validation/userValidation.js'
import passport from 'passport'
import { CLIENT_DOMAIN } from '../config/config.js'


const router = express.Router()
interface CustomRequest extends Request {
    user?: any
}

interface CustomRequest extends Request {
    user?: any
}


router.get('/profile', AuthMiddleware, (req: CustomRequest, res: Response, next: NextFunction) => {
    res.status(200).json({ message: "Data retieved", data: req.user })
    next()
})


router.post('/create', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { error, message } = ValidationLogin(req.body)
        if (error)
            next(CustomError.BadRequestError(message))
        await new UserController().userRegistration(req, res, next)
    } catch (error) {
        console.log(error)
        next(error)
    }
})


router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { error, message } = ValidationLogin(req.body)
        if (error)
            next(CustomError.BadRequestError(message))
        await new UserController().userLogin(req, res, next)
    } catch (error) {
        next(error)
    }
})

router.post('/activate', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { error, message } = ValidationActivate(req.body)
        if (error)
            next(CustomError.BadRequestError(message))
        await new UserController().activateAccount(req, res, next)
    } catch (error) {
        next(error)
    }
})

router.post('/reset', async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { error, message } = ValidationReset(req.body)
        if (error)
            next(CustomError.BadRequestError(message))
        await new UserController().resetPassword(req, res, next)
    } catch (error) {
        next(error)
    }
})

router.post('/reset/otp', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { error, message } = ValidateEmail(req.body)
        if (error)
            next(CustomError.BadRequestError(message))
        await new UserController().userResetPasswordOtp(req, res, next)
    } catch (error) {
        next(error)
    }
})


router.post('/change/password', AuthMiddleware, async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const { error, message } = ValidateChangePassword(req.body)
        if (error)
            next(CustomError.BadRequestError(message))
        if (!req.user)
            next(CustomError.AuthenticationError("Expired or invalid session, kindly login"))

        await new UserController().changePassword(req, res, next)
    } catch (error) {
        next(error)
    }
})


//GOOGLE AUTH ENPOINTS 
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));


//GOOGLE CALLBACK ENDPOINT
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: `${CLIENT_DOMAIN}/login` }), async (req: Request, res: Response) => {
    const userProfile: any = req.user;
    const { given_name, family_name, email, picture } = userProfile._json
    await new UserController().handleGoogleAuth({ firstName: given_name, lastName: family_name, avatar: picture, email }, res)
    res.redirect(`${CLIENT_DOMAIN}/profile`)
}
);



export default router