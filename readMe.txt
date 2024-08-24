Setup Instructions

Install Dependencies:
Navigate to the project directory.
Run npm install to install all the necessary dependencies.
Database Setup:
Import the sql_transaction.sql file into your MySQL server to set up the database and tables.
Update the database configuration in index.js with your MySQL credentials.
Create Initial Admin User:
Before running the application, create the initial admin user:
Use a tool like Postman or cURL to send a POST request to http://localhost:8080/create-admin with the following JSON payload:
json
Copy code
{
    "id": "1",
    "username": "admin",
    "password": "adminpassword"
}
This will create the first admin user with the username admin and the password adminpassword.
After creating the admin, you can log in and add more users as needed.
Run the Application:
Use npm start to run the server.
Access the application via http://localhost:8080 in your web browser.
User Roles and Permissions
1. Admin
Login: Admins can log in using their credentials.
Add User: Admins can add new users with a specified role (admin/user).
View All Transactions: Admins can view all user transactions.
Approve/Reject Transactions: Admins can approve or reject transactions.
View Transaction Details: Admins can view detailed information on each transaction.
Persistent Login: Admin sessions remain active until logout.
2. User
Login: Users can log in using their credentials.
Add Transaction: Users can add new transactions.
Request Approval: Users can request approval for their transactions from the admin.
View Approved Transactions: Users can view transactions that have been approved.
Persistent Login: User sessions remain active until logout.


Available Routes
Authentication
Login: /login
Logout: /logout
Admin Routes
Dashboard: /admin/dashboard
Add User: /register
View Transactions: /admin/transactions
View Transaction Details: /transactions/:id
User Routes
Dashboard: /user
Add Transaction: /transactions/new
View Approved Transactions: /user/transactions


Security Measures
Password Security:

Hashing: User passwords are securely hashed using the bcrypt hashing algorithm before storing them in the database.
This ensures that passwords are never stored in plain text, making it more difficult for attackers to obtain usable credentials even if the database is compromised.
Salted Hashing: Bcrypt automatically adds a unique salt to each password before hashing. This prevents attackers from using precomputed hash tables (rainbow tables) to crack passwords.
Password Length: The application enforces a minimum password length to enhance security and reduce the risk of brute-force attacks.

Session Management:

Session Cookies: User sessions are maintained using secure, HTTP-only cookies to prevent unauthorized access. The session cookie is used to track user authentication status without exposing sensitive data.
Persistent Login: Sessions remain active until the user logs out or the session expires, ensuring that users don't have to repeatedly log in, enhancing convenience while maintaining security.
Access Control:

Role-Based Authorization: The application enforces strict role-based access control, ensuring that only admins can perform admin-level actions (e.g., adding users, viewing all transactions) and users can only perform actions permitted to them.
Secure Routes: Routes are protected by middleware functions that check if a user is authenticated and has the appropriate role before allowing access.
Data Validation:

Input Validation: User inputs are validated on both the client and server sides to prevent common security vulnerabilities such as SQL injection and cross-site scripting (XSS).
Error Handling: The application uses proper error handling mechanisms to ensure that sensitive information is not leaked in error messages.
