const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const { supabase: globalSupabase } = require('../config/supabase');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.query.token) {
        token = req.query.token;
    }

    if (token) {
        try {
            // Verify token with Global Client (Stateless verification)
            const { data: { user: authUser }, error } = await globalSupabase.auth.getUser(token);

            if (error || !authUser) {
                console.error("Auth Error:", error);
                return res.status(401).json({ message: 'Not authorized, token failed' });
            }

            // Create a scoped client acting as the user (to pass RLS)
            const scopedSupabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
                global: {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            });

            // Sync/Check public.Users table
            let { data: dbUser, error: dbError } = await scopedSupabase
                .from('users')
                .select('*')
                .eq('id', authUser.id)
                .single();

            // If not found (and no other error like permission denied), create it

            if (!dbUser) {
                // Determine email/username from authUser
                const email = authUser.email;
                const username = authUser.user_metadata?.username || email.split('@')[0];

                console.log(`Syncing user profile for ${email}...`);

                // Create user in public table
                const { data: newUser, error: createError } = await scopedSupabase
                    .from('users')
                    .insert([{
                        id: authUser.id,
                        email: email,
                        username: username,
                        role: 'user'
                    }])
                    .select()
                    .single();

                if (createError) {
                    console.error("User Sync Error Details:", JSON.stringify(createError, null, 2));
                    // Check if error is RLS related (42501)
                    if (createError.code === '42501') {
                        return res.status(500).json({ message: 'Database Permission Error: Please ensure RLS policies allow INSERT.' });
                    }
                    return res.status(500).json({ message: 'Error syncing user profile: ' + createError.message });
                }
                dbUser = newUser;
            }

            req.user = dbUser;
            req.token = token;
            next();
        } catch (error) {
            console.error("Middleware Error:", error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};

module.exports = { protect, admin };
