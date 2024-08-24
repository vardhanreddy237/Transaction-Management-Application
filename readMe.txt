# Role-Based Auth Transaction Manager

## Overview
The **Role-Based Auth Transaction Manager** is a web application built with Node.js that provides role-based authentication and transaction management. The application supports both admin and user roles, enabling admins to manage users and transactions, while users can add and view their transactions. The authentication system ensures secure access based on roles, with features like persistent sessions, password hashing, and more.

## Features
- **Role-Based Authentication**: Secure login system with role-based access control for admins and users.
- **Persistent Sessions**: Users remain logged in across sessions until they explicitly log out.
- **Transaction Management**: 
  - Users can add new transactions and view their approved transactions.
  - Admins can view all transactions, approve or reject them, and see which user each transaction belongs to.
- **Password Security**: User passwords are hashed using bcrypt for secure storage.
- **Admin Management**: Admins can add new users and manage transactions.
- **User-Friendly Interface**: Clean and simple interface with EJS templating.

## Prerequisites
- Node.js and npm installed
- MySQL server set up and running
- Git installed for version control

## Installation
1. **Clone the repository:**
   ```bash
   git clone https://github.com/vardhanreddy237/role-based-auth-transaction-manager.git
   cd role-based-auth-transaction-manager
2. Install dependencies:
3. Set up the database:
Create a new MySQL database (e.g., transactions10).
Run the provided SQL script to set up the necessary tables.

4.Configure the database connection:
Update the MySQL connection settings in index.js with your database credentials.

5.Create the initial admin user:
Use the /create-admin endpoint to create the first admin user.
POST /create-admin
{
    "id": "1",
    "username": "admin",
    "password": "securepassword"
}

6.Start the application
npm start

Usage
Admin Login: Use the admin credentials to log in and access the admin dashboard. From there, you can manage users and transactions.
User Login: Users can log in to add and view their transactions.
Session Management: Sessions are persistent, so users remain logged in until they explicitly log out.

Security Measures
Password Security: Passwords are hashed using bcrypt before being stored in the database, ensuring that even in the event of a database breach, passwords remain protected.
Session Security: Session management ensures that users remain authenticated across sessions, with cookies secured for added protection.
Role-Based Access Control: Access to sensitive actions is restricted based on user roles, ensuring that only authorized users can perform certain actions.


If you wish to contribute to this project, please fork the repository, create a new branch for your feature or bug fix, and submit a pull request. Contributions are welcome!
