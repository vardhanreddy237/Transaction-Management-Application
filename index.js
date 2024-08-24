const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const session = require('express-session');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const app = express();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static('public'));
app.use(session({
    secret: '202408', 
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } 
}));
app.use(flash());
app.set('view engine', 'ejs');

// Database connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'transactions10',
    password: '5958@Kvreddy'
});

connection.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err.stack);
        return;
    }
    console.log('Connected to MySQL');
});

function ensureAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.redirect('/login');
}


// Authentication middleware
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    } else {
        res.redirect('/login');
    }
}

function isAdmin(req, res, next) {
    if (req.session.user && req.session.user.role === 'admin') {
        return next();
    } else {
        res.redirect('/login');
    }
}


// Home route
app.get('/', (req, res) => {
    res.redirect('/login');
});

// Login route
app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const query = 'SELECT * FROM users WHERE username = ?';
    connection.query(query, [username], (err, result) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Error occurred');
            return;
        }
        if (result.length > 0) {
            bcrypt.compare(password, result[0].password, (err, match) => {
                if (match) {
                    req.session.user = result[0];
                    if (result[0].role === 'admin') {
                        res.redirect('/admin');
                    } else {
                        res.redirect('/user');
                    }
                } else {
                    res.send('Invalid username or password');
                }
            });
        } else {
            res.send('Invalid username or password');
        }
    });
});

// Register route (Admin can add users)
app.get('/register', isAdmin, (req, res) => {
    res.render('add_user');
});


app.post('/register', isAdmin, (req, res) => {
    const { username, password, role } = req.body;
    bcrypt.hash(password, 10, (err, hash) => {
        const query = 'INSERT INTO users (id, username, password, role) VALUES (?, ?, ?, ?)';
        const values = [req.body.id, username, hash, role];
        connection.query(query, values, (err, result) => {
            if (err) {
                console.error('Error executing query:', err);
                res.status(500).send('Error occurred');
                return;
            }
            res.redirect('/admin');
        });
    });
});

// Admin dashboard
app.get('/admin', isAuthenticated, (req, res) => {
    if (req.session.user.role !== 'admin') {
        return res.status(403).send('Access denied');
    }
    res.render('admin_dashboard'); // Make sure this matches your EJS file name
});


// Admin dashboard
app.get('/admin/dashboard', ensureAuthenticated, (req, res) => {
    // Check if the logged-in user is an admin
    if (req.session.user.role !== 'admin') {
        return res.status(403).send('Access denied');
    }
    res.render('admin_dashboard'); // Render the admin dashboard view
});

app.get('/user/transactions', ensureAuthenticated, (req, res) => {
    if (req.session.user.role !== 'user') {
        return res.status(403).send('Access denied');
    }
    const query = 'SELECT * FROM transactions_table WHERE user_id = ? AND status = "approved"';
    connection.query(query, [req.session.user.id], (err, results) => {
        if (err) {
            console.error('Error fetching transactions:', err);
            return res.status(500).send('Error occurred');
        }
        res.render('user_transactions', { transactions: results });
    });
});




// User dashboard
app.get('/user', isAuthenticated, (req, res) => {
    res.render('user_dashboard');
});

// Route to add a new transaction (User)
app.get('/transactions/new', isAuthenticated, (req, res) => {
    res.render('add_transaction', { formAction: '/transactions', method: null, transaction: null });
});


app.post('/transactions', isAuthenticated, (req, res) => {
    const values = req.body;
    const transaction = [
        values.id,
        values.transaction_id,
        values.customer_id,
        values.transaction_date,
        values.amount,
        'Pending',
        values.payment_method,
        values.currency,
        req.session.user.id
    ];
    const query = 'INSERT INTO transactions_table (id, transaction_id, customer_id, transaction_date, amount, status, payment_method, currency, user_id) VALUES (?)';

    connection.query(query, [transaction], (err, result) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Error occurred');
            return;
        }
        res.redirect('/user');
    });
});

// Route to view all transactions (Admin)
app.get('/admin/transactions', ensureAuthenticated, (req, res) => {
    if (req.session.user.role !== 'admin') {
        return res.status(403).send('Access denied');
    }
    // Query to fetch all transactions along with user information
    const query = `
        SELECT transactions_table.*, users.username AS user_name 
        FROM transactions_table
        LEFT JOIN users ON transactions_table.user_id = users.id
    `;
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching transactions:', err);
            return res.status(500).send('Error occurred');
        }
        res.render('admin_transactions', { transactions: results });
    });
});




// Route to approve/reject a transaction (Admin)
app.put('/transactions/:id', isAdmin, (req, res) => {
    const id = req.params.id;
    const status = req.body.status;
    const query = 'UPDATE transactions_table SET status = ? WHERE id = ?';
    connection.query(query, [status, id], (err, result) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Error occurred');
            return;
        }
        res.redirect('/admin/transactions');
    });
});

// Route to view a transaction by ID (Admin)
app.get('/admin/transactions/:id', isAdmin, (req, res) => {
    const id = req.params.id;
    const query = 'SELECT * FROM transactions_table WHERE id = ?';
    connection.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error fetching transaction:', err);
            return res.status(500).send('Error occurred');
        }
        if (result.length > 0) {
            res.render('transaction_detail', { 
                transaction: result[0],
                role: req.session.user.role
            });
        } else {
            res.send('Transaction not found');
        }
    });
});

// Route to view a transaction by ID (User)
app.get('/user/transactions/:id', isAuthenticated, (req, res) => {
    const id = req.params.id;
    const query = 'SELECT * FROM transactions_table WHERE id = ? AND user_id = ? AND status = "Approved"';
    connection.query(query, [id, req.session.user.id], (err, result) => {
        if (err) {
            console.error('Error fetching transaction:', err);
            return res.status(500).send('Error occurred');
        }
        if (result.length > 0) {
            res.render('transaction_detail', { 
                transaction: result[0],
                role: req.session.user.role
            });
        } else {
            res.send('Transaction not found or not approved');
        }
    });
});



// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            res.status(500).send('Error occurred');
            return;
        }
        res.redirect('/login');
    });
});

// Temporary route to create the first admin user
app.post('/create-admin', async (req, res) => {
    const { id, username, password } = req.body;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const adminUser = {
        id: id,
        username: username,
        password: hashedPassword,
        role: 'admin'
    };

    const query = 'INSERT INTO users (id, username, password, role) VALUES (?, ?, ?, ?)';
    connection.query(query, [adminUser.id, adminUser.username, adminUser.password, adminUser.role], (err, result) => {
        if (err) {
            console.error('Error creating admin:', err);
            return res.status(500).send('Error occurred while creating admin');
        }
        res.send('Admin user created successfully');
    });
});



// Start the server
app.listen(8080, () => {
    console.log('Server is listening on port 8080');
});
