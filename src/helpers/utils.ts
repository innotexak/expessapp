import jwt, { decode } from 'jsonwebtoken';
import { JWT_SECRET_KEY } from '../config/config.js';
import { compare, hash } from 'bcrypt';
import __AccountSchema from '../models/userSchema.js';
import CustomError from '../helpers/errorHandler.js';




class Utils {

    async generateToken(payload: { email: string, role?: string }) {
        return jwt.sign(payload, JWT_SECRET_KEY as string, { expiresIn: '1hr' });
    }

    async hashPassword(password: string) {
        return await hash(password, 10)
    }

    async isMatchPassword(hashPassword: string, plainPassword: string) {
        return await compare(plainPassword, hashPassword)

    }

    generateRandomDigit() {
        return Math.floor(Math.random() * 10);
    }


    generateSixDigitNumber() {
        let sixDigitNumber = '';
        for (let i = 0; i < 4; i++) {
            sixDigitNumber += this.generateRandomDigit();
        }
        return sixDigitNumber;
    }

    decodeToken(token: string) {
        return decode(token)
    }

    async extractUserDetails(token: string) {
        const payload: any = this.decodeToken(token)
        const tokenExpired = this.isTokenExpired(payload)
        if (!tokenExpired) {
            const userData: any = await __AccountSchema.findOne({ email: payload.email })
            return userData
        }
        throw CustomError.AuthenticationError("Expired Session, please kindly login")


    }

    isTokenExpired(decoded: any) {
        const currentTimeInSeconds = Math.floor(Date.now() / 1000);
        return decoded.exp < currentTimeInSeconds;
    }

    generateOtp(): number {
        return Math.floor(Math.random() * 9000) + 1000;
    }


}

export default Utils;


