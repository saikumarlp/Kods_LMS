import prisma from '../config/prisma.js';
import bcrypt from 'bcrypt';
import generateTokens from '../utils/generateTokens.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        const userExists = await prisma.user.findUnique({ where: { email } });

        if (userExists) {
            res.status(400);
            throw new Error('User already exists');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || 'STUDENT',
            },
        });

        if (user) {
            const { accessToken, refreshToken } = generateTokens(user.id, user.role);
            res.status(201).json({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                accessToken,
                refreshToken
            });
        } else {
            res.status(400);
            throw new Error('Invalid user data');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });

        if (user && (await bcrypt.compare(password, user.password))) {
            const { accessToken, refreshToken } = generateTokens(user.id, user.role);

            res.json({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                accessToken,
                refreshToken
            });
        } else {
            res.status(401);
            throw new Error('Invalid email or password');
        }
    } catch (error) {
        next(error);
    }
};
