import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Admin } from "../../models/admin.model.js";
import config from "../../config/index.js";

/**
 * Authenticate admin with email and password.
 * Returns a signed JWT on success.
 */
const login = async (email: string, password: string) => {
    const admin = await Admin.findOne({ email }).select("+password");

    if (!admin) {
        throw new Error("Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
        throw new Error("Invalid credentials");
    }

    const secret = config.jwt_secret || config.secret;
    const token = jwt.sign(
        { id: admin._id, email: admin.email, role: admin.role },
        secret,
        { expiresIn: config.jwt_expires_in as jwt.SignOptions["expiresIn"] }
    );

    return { token, admin: { id: admin._id, email: admin.email, role: admin.role } };
};

export const authService = { login };
