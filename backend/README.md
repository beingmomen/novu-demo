# Novu Demo Backend

Node.js + Express.js backend for Vacation Request System with Novu notifications.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose)
- **Notifications:** @novu/api v3.11.0

## Project Structure

```
backend/
├── config/
│   ├── db.js           # MongoDB connection
│   └── novu.js         # Novu SDK initialization
├── models/
│   ├── User.js         # User model (employee/manager)
│   └── VacationRequest.js  # Vacation request model
├── routes/
│   ├── users.js        # User CRUD + Novu subscriber sync
│   ├── vacationRequests.js  # Vacation requests + notifications
│   └── notifications.js     # Notification utilities
├── server.js           # Express app entry point
├── .env.example        # Environment variables template
└── package.json
```

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your values:

```env
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/novu-demo
NOVU_API_KEY=your_novu_api_key_here
```

### 3. Get Novu API Key

1. Go to [Novu Dashboard](https://dashboard.novu.co)
2. Navigate to **Settings** → **API Keys**
3. Copy the API Key

### 4. Run Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server runs at `http://localhost:3000`

## API Endpoints

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users |
| POST | `/api/users` | Create user (syncs with Novu) |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |

### Vacation Requests

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/vacation-requests?userId=xxx` | Get requests (filtered by role) |
| POST | `/api/vacation-requests` | Create request (notifies manager) |
| PATCH | `/api/vacation-requests/:id/approve` | Approve request (notifies employee) |
| PATCH | `/api/vacation-requests/:id/reject` | Reject request (notifies employee) |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | API health status |

## Novu Integration

### SDK Initialization

```javascript
// config/novu.js
const { Novu } = require("@novu/api");

const novu = new Novu({
  secretKey: process.env.NOVU_API_KEY,
});
```

### Triggering Notifications

```javascript
await novu.trigger({
  workflowId: 'vacation-request-submitted',
  to: subscriberId,
  payload: {
    employeeName: 'John Doe',
    startDate: '2024-01-15',
    endDate: '2024-01-20',
    reason: 'Family vacation'
  }
});
```

### Required Novu Workflows

Create these workflows in Novu Dashboard:

1. **vacation-request-submitted** - Sent to manager when employee submits request
2. **vacation-request-approved** - Sent to employee when manager approves
3. **vacation-request-rejected** - Sent to employee when manager rejects

## Data Models

### User

```javascript
{
  name: String,
  email: String,
  role: 'employee' | 'manager',
  managerId: ObjectId (ref: User),
  novuSubscriberId: String  // Auto-generated for Novu
}
```

### VacationRequest

```javascript
{
  employeeId: ObjectId (ref: User),
  startDate: Date,
  endDate: Date,
  reason: String,
  status: 'pending' | 'approved' | 'rejected',
  managerNotes: String
}
```
