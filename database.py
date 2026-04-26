import sqlite3

def init_db():
    conn = sqlite3.connect('casino.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS users
                 (user_id INTEGER PRIMARY KEY, username TEXT, gold INTEGER DEFAULT 100, silver INTEGER DEFAULT 50)''')
    c.execute('''CREATE TABLE IF NOT EXISTS bets
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, round_id TEXT, amount INTEGER, currency TEXT, cashed_out INTEGER DEFAULT 0)''')
    conn.commit()
    conn.close()

def get_or_create_user(user_id, username):
    conn = sqlite3.connect('casino.db')
    c = conn.cursor()
    c.execute("INSERT OR IGNORE INTO users (user_id, username) VALUES (?, ?)", (user_id, username))
    conn.commit()
    user = c.execute("SELECT * FROM users WHERE user_id=?", (user_id,)).fetchone()
    conn.close()
    return user

def update_balance(user_id, gold=None, silver=None):
    conn = sqlite3.connect('casino.db')
    c = conn.cursor()
    if gold is not None:
        c.execute("UPDATE users SET gold=? WHERE user_id=?", (gold, user_id))
    if silver is not None:
        c.execute("UPDATE users SET silver=? WHERE user_id=?", (silver, user_id))
    conn.commit()
    conn.close()
