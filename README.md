# CourseBundler -- Backend 🚀

A production-ready backend platform for creating, managing, and
monetizing online courses.

This application allows content creators to publish courses and earn
through a monthly subscription model, while students can subscribe,
access lectures, and manage their learning journey.

Live Deployment: https://coursebundler-backend-er26.onrender.com


------------------------------------------------------------------------

# 📌 Overview

CourseBundler is a subscription-based course platform backend built with
a scalable architecture.

It supports:

-   User authentication & authorization
-   Admin content management
-   Course & lecture management
-   Subscription-based access control
-   Razorpay payment integration
-   Playlist system
-   Contact & course request management
-   Admin dashboard statistics

------------------------------------------------------------------------

# 🏗️ Tech Stack

-   Node.js
-   Express.js
-   MongoDB
-   JWT Authentication
-   Razorpay Payment Gateway
-   Multer (File Uploads)
-   Cloud Storage (Media Handling)
-   MVC Architecture

------------------------------------------------------------------------

# 📂 Folder Structure

config/\
constants/\
controllers/\
lib/\
middlewares/\
models/\
routes/\
utils/\
app.js\
server.js\
vercel.json

Architecture follows clean separation of concerns:

-   Controllers → Business logic\
-   Models → Database schemas\
-   Routes → API endpoints\
-   Middlewares → Authentication, authorization, validation\
-   Utils → Helper functions

------------------------------------------------------------------------

# 🔐 Authentication & User Routes

POST /register\
POST /login\
GET /logout\
GET /me\
DELETE /me\
PUT /changepassword\
PUT /updateprofile\
PUT /updateprofilepicture\
POST /forgetpassword\
PUT /resetpassword/:resetPasswordToken

Playlist Management:

POST /addToPlaylist\
DELETE /removeFromPlaylist

------------------------------------------------------------------------

# 👑 Admin Routes

GET /admin/users\
PUT /admin/user/:userId\
DELETE /admin/user/:userId\
GET /admin/contacts\
GET /admin/requests\
GET /admin/stats

------------------------------------------------------------------------

# 📚 Course Routes

GET /all\
POST /create\
GET /:courseId\
POST /:courseId\
DELETE /:courseId\
DELETE /lecture/:courseId

Features:

-   Course creation with thumbnail upload\
-   Add lectures (max 100MB video upload)\
-   Subscriber-only access to lectures\
-   Course deletion & lecture management

------------------------------------------------------------------------

# 💳 Payment & Subscription Routes

GET /subscribe\
POST /paymentverification\
GET /razorpaykey\
DELETE /subscribe/cancel

Features:

-   Razorpay subscription integration\
-   Secure payment verification\
-   Subscription cancellation\
-   Subscriber-based content authorization

------------------------------------------------------------------------

# 📩 Additional Features

Contact System:

POST /contact\
POST /contact/:contactId\
DELETE /contact/:contactId

Course Requests:

POST /courserequest\
PUT /courserequest/:requestId\
DELETE /courserequest/:requestId

------------------------------------------------------------------------

# 🔒 Role-Based Access Control

Roles:

-   User\
-   Admin\
-   Subscriber

Middleware ensures:

-   JWT Authentication\
-   Role Authorization\
-   Subscriber-only content access

------------------------------------------------------------------------

# 📊 Admin Dashboard

Includes:

-   Total users\
-   Active subscriptions\
-   Revenue insights\
-   Platform activity metrics

------------------------------------------------------------------------

# 🎯 Key Highlights

-   Subscription-based monetization model\
-   Secure authentication & authorization\
-   Scalable backend architecture\
-   Payment gateway integration\
-   Media upload handling\
-   Clean MVC structure\
-   Production deployment ready

------------------------------------------------------------------------

# 🚀 Ideal For

-   EdTech platforms\
-   Course creators\
-   Subscription-based SaaS platforms\
-   Backend portfolio showcase

------------------------------------------------------------------------

# 👨‍💻 Author

Manish Patidar

LinkedIn: https://www.linkedin.com/in/manish-patidar-726670213/

X (Twitter): https://x.com/ManishPati13927

Codolio: https://codolio.com/profile/manish_patidar

------------------------------------------------------------------------

If you find this project useful, consider starring the repository.
