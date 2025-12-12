const { supabase } = require('../config/supabase');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // Not strictly needed if we simulate auth or use Supabase Auth, but keeping for logic

// Helper to generate local JWT for our app session (if not using Supabase Auth tokens directly)
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if user exists
        const { data: existingUser, error: findError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password (manual auth)
        // Note: Ideally use supabase.auth.signUp(), but preserving custom flow as requested
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert([{
                username,
                email,
                password: hashedPassword,
                role: 'user'
            }])
            .select()
            .single();

        if (createError) throw createError;

        if (newUser) {
            res.status(201).json({
                model: {
                    id: newUser.id,
                    username: newUser.username,
                    email: newUser.email,
                    role: newUser.role,
                    token: generateToken(newUser.id, newUser.role),
                }
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

const magicLinkLogin = async (req, res) => {
    // Deprecated: Client now uses supabase.auth.signInWithOtp() directly.
    res.status(400).json({ message: 'Use Supabase Auth on client directly.' });
};

const getMe = async (req, res) => {
    try {
        // req.user is already populated by protect middleware
        const user = req.user;
        if (user) delete user.password;
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = { registerUser, magicLinkLogin, getMe };
