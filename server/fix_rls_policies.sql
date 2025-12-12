-- Enable RLS (Row Level Security) on transactions table
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to INSERT their own transactions
CREATE POLICY "Users can insert their own transactions"
ON transactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to SELECT their own transactions
CREATE POLICY "Users can view their own transactions"
ON transactions
FOR SELECT
USING (auth.uid() = user_id);

-- Policy to allow users to DELETE their own transactions
CREATE POLICY "Users can delete their own transactions"
ON transactions
FOR DELETE
USING (auth.uid() = user_id);

-- Also ensure 'users' table has policies if needed, generally useful for Profile
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" 
ON users FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON users FOR INSERT WITH CHECK (auth.uid() = id);
