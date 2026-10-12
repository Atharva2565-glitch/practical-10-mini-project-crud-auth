# Practical 10: Create a Mini Project Demonstrating Complete CRUD Operations and Authentication

## Aim
To develop a mini Student Management System using the MERN stack that demonstrates complete CRUD operations and user authentication using JWT.

## Objectives
- Develop a full-stack application using MongoDB, Express.js, React.js and Node.js
- Implement user registration and login
- Implement JWT-based authentication
- Perform Create, Read, Update and Delete operations
- Connect the React frontend with the Express backend using REST APIs
- Store and retrieve student information from MongoDB
- Protect application routes using authentication middleware
- Handle validation and errors in the application

## Technologies Used
- **Frontend:** React.js, React Router DOM, Vite
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Authentication:** JWT (jsonwebtoken), bcryptjs
- **Other:** CORS, dotenv

## Project Structure
```
practical-10-mini-project-crud-auth/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   └── Student.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── studentRoutes.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── .env
│   ├── .gitignore
│   ├── server.js
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── App.css
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── .env
```

## How to Run

### Prerequisites
- Node.js installed
- MongoDB running locally or MongoDB Atlas account
- Two terminal windows

### Backend Setup
```bash
cd backend
npm install
```

Create `.env` file in backend folder:
```
MONGO_URI=mongodb://localhost:27017/student_crud_auth
JWT_SECRET=myStudentAppSecret123
PORT=5000
```

Start MongoDB, then:
```bash
npm run dev
```
Backend runs on: `http://localhost:5000`

### Frontend Setup (new terminal)
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on: `http://localhost:5173`

## API Endpoints

### Authentication (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |

### Students (Protected - Requires JWT)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/students` | Create student |
| GET | `/api/students` | Get all students |
| GET | `/api/students/:id` | Get student by ID |
| PUT | `/api/students/:id` | Update student |
| DELETE | `/api/students/:id` | Delete student |

## Testing with Postman

### 1. Register User
- **POST** `http://localhost:5000/api/auth/register`
```json
{
  "name": "Amit",
  "email": "amit@gmail.com",
  "password": "123456"
}
```
- **Response:** `{ "message": "Registration successful", "userId": "..." }`

### 2. Login User
- **POST** `http://localhost:5000/api/auth/login`
```json
{
  "email": "amit@gmail.com",
  "password": "123456"
}
```
- **Response:** `{ "message": "Login successful", "token": "eyJhbGciOiJIUzI1NiIs..." }`
- **Copy the token** for next steps

### 3. Create Student (Protected)
- **POST** `http://localhost:5000/api/students`
- **Headers:** `Authorization: Bearer YOUR_TOKEN`
```json
{
  "name": "Sneha",
  "email": "sneha@gmail.com",
  "age": 21,
  "course": "BCA"
}
```

### 4. Read Students (Protected)
- **GET** `http://localhost:5000/api/students`
- **Headers:** `Authorization: Bearer YOUR_TOKEN`

### 5. Update Student (Protected)
- **PUT** `http://localhost:5000/api/students/STUDENT_ID`
- **Headers:** `Authorization: Bearer YOUR_TOKEN`
```json
{
  "name": "Sneha Patil",
  "email": "sneha@gmail.com",
  "age": 22,
  "course": "MCA"
}
```

### 6. Delete Student (Protected)
- **DELETE** `http://localhost:5000/api/students/STUDENT_ID`
- **Headers:** `Authorization: Bearer YOUR_TOKEN`

## Frontend Features

### Pages
1. **Login Page** (`/login`) - Email/password login
2. **Register Page** (`/register`) - Name/email/password registration
3. **Students Dashboard** (`/students`) - Protected CRUD interface

### Dashboard Capabilities
- View all students in a table
- Add new student (modal form)
- Edit existing student (modal form pre-filled)
- Delete student (with confirmation)
- Logout button
- Responsive design

### Authentication Flow
1. User registers → stored in MongoDB with hashed password
2. User logs in → JWT generated and stored in localStorage
3. All student API calls include `Authorization: Bearer <token>` header
4. Backend middleware verifies JWT on each request
5. Protected routes redirect to login if not authenticated

## Validation & Error Handling

### Frontend
- Required field validation
- Email format validation
- Age range (18-60)
- Password minimum length (6 chars)

### Backend
- Express validation for required fields
- Mongoose schema validation
- Duplicate email check (409 Conflict)
- JWT verification middleware
- Global error handling

### Error Responses
```json
// Without JWT Token
{ "message": "Authentication required" }

// Invalid JWT Token
{ "message": "Invalid or expired token" }

// Missing Fields
{ "message": "All fields are required" }

// Student Not Found
{ "message": "Student not found" }
```

## Authentication Flow Diagram
```
              Register
                 |
                 v
          Password Hashing
                 |
                 v
             MongoDB
                 |
                 v
               Login
                 |
                 v
         Verify Password
                 |
                 v
            Generate JWT
                 |
                 v
         Send Token to Client
                 |
                 v
       Protected CRUD Request
                 |
                 v
         Verify JWT Token
                 |
           +-----+-----+
           |           |
         Valid       Invalid
           |           |
           v           v
        CRUD API    401 Error
```

## Expected Output

### Login Page
```
┌──────────────────────────────────┐
│      Student Management System   │
│           Login                  │
├──────────────────────────────────┤
│ Email:    [__________________]   │
│ Password: [__________________]   │
│ [ Login ]                        │
│                                  │
│ Don't have an account?           │
│ [ Register ]                     │
└──────────────────────────────────┘
```

### Student Management Page (After Login)
```
┌─────────────────────────────────────────────────────────────┐
│ Student Management System                    [Logout] [+Add]│
├─────────────────────────────────────────────────────────────┤
│ ID      Name       Email              Age   Course  Actions │
├─────────────────────────────────────────────────────────────┤
│ a1b2c3  Sneha      sneha@gmail.com     21    BCA    [E][D]  │
│ d4e5f6  Amit       amit@gmail.com      22    MCA    [E][D]  │
└─────────────────────────────────────────────────────────────┘
```

### Add/Edit Student Modal
```
┌──────────────────────────────────┐
│      Add Student                 │
├──────────────────────────────────┤
│ Name:    [__________________]    │
│ Email:   [__________________]    │
│ Age:     [__________________]    │
│ Course:  [__________________]    │
│ [Cancel]         [Add Student]   │
└──────────────────────────────────┘
```

## Key Implementation Details

### Backend
- **User Model:** name, email (unique), password (hashed)
- **Student Model:** name, email (unique), age (18-60), course
- **Auth Middleware:** Verifies Bearer token, attaches user to req
- **Student Routes:** All protected with `router.use(authMiddleware)`
- **Password Security:** bcrypt with 10 salt rounds
- **JWT:** 1 hour expiry, contains userId and email

### Frontend
- **Auth Context:** Manages user state, login/logout, token storage
- **API Helper:** Auto-attaches Authorization header
- **ProtectedRoute:** Redirects to login if not authenticated
- **Modal Forms:** Add/Edit in same component
- **React Router:** Client-side routing with protected routes

## Deployment Notes
For production deployment:
1. Set strong `JWT_SECRET` in environment
2. Use MongoDB Atlas connection string
3. Configure CORS for specific frontend domain
4. Set `VITE_API_URL` to deployed backend URL
5. Deploy backend as Web Service, frontend as Static Site (Render/Vercel/Netlify)

## Conclusion
The mini project demonstrates how authentication and CRUD operations can be integrated into a complete MERN stack application. JWT provides authentication for protected APIs, while MongoDB and Mongoose manage student data. The project provides practical understanding of frontend-backend communication, REST APIs, database operations, authentication, validation, and error handling.# practical-10-student-crud-auth
# Atharva2565-glitch-practical-10-mini-project-crud-auth
# practical-10-mini-project-crud-auth
