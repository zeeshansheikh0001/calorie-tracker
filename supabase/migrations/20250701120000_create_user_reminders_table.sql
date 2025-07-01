
CREATE TABLE user_reminders (
    user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
    log_meals BOOLEAN DEFAULT FALSE,
    log_meals_time TIME,
    drink_water BOOLEAN DEFAULT FALSE,
    drink_water_frequency TEXT,
    weigh_in BOOLEAN DEFAULT FALSE,
    weigh_in_day TEXT,
    weigh_in_time TIME,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reminders."
ON user_reminders FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reminders."
ON user_reminders FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminders."
ON user_reminders FOR UPDATE
USING (auth.uid() = user_id);
