import jwt from 'jsonwebtoken';
import { IUser } from '../models/User';

interface TokenPayload {
    userId: string;
    tenantId: string;
    email: string;
    role: string;
}

export class AuthService {
    private static readonly JWT_SECRET: string = process.env.JWT_SECRET || 'fallback-secret';
    private static readonly JWT_REFRESH_SECRET: string = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret';
    private static readonly JWT_EXPIRE: string = process.env.JWT_EXPIRE || '15m';
    private static readonly JWT_REFRESH_EXPIRE: string = process.env.JWT_REFRESH_EXPIRE || '7d';

    /**
     * Generate access token (short-lived)
     */
    static generateAccessToken(user: IUser): string {
        const payload: TokenPayload = {
            userId: user._id.toString(),
            tenantId: user.tenantId.toString(),
            email: user.email,
            role: user.role
        };

        return jwt.sign(payload, this.JWT_SECRET as any, {
            expiresIn: this.JWT_EXPIRE as any
        });
    }

    /**
     * Generate refresh token (long-lived)
     */
    static generateRefreshToken(user: IUser): string {
        const payload: TokenPayload = {
            userId: user._id.toString(),
            tenantId: user.tenantId.toString(),
            email: user.email,
            role: user.role
        };

        return jwt.sign(payload, this.JWT_REFRESH_SECRET as any, {
            expiresIn: this.JWT_REFRESH_EXPIRE as any
        });
    }

    /**
     * Verify access token
     */
    static verifyAccessToken(token: string): TokenPayload {
        return jwt.verify(token, this.JWT_SECRET) as TokenPayload;
    }

    /**
     * Verify refresh token
     */
    static verifyRefreshToken(token: string): TokenPayload {
        return jwt.verify(token, this.JWT_REFRESH_SECRET) as TokenPayload;
    }

    /**
     * Decode token without verification (for debugging)
     */
    static decodeToken(token: string): TokenPayload | null {
        try {
            return jwt.decode(token) as TokenPayload;
        } catch {
            return null;
        }
    }
}
