# Birthday Reminder Application

This application manages users and automatically sends birthday wishes based on their timezones. It includes an API backend and a scheduled worker job to check birthdays.

---

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [Running with Docker](#running-with-docker)
- [API Examples](#api-examples)
- [Assumptions & Design Decisions](#assumptions--design-decisions)
- [Limitations](#limitations)
- [Testing](#testing)

---

## Features

- Create, read, and delete users with timezone and birthday data
- Cron job to check and log birthday wishes at 9 AM in users timezones
- REST API with JSON payloads

---

## Getting Started

1. Clone the repository:
   ```
    git clone https://github.com/ridhosatriawan/birthday-reminder
    cd birthday-reminder
   ```
2. Create a `.env` file based on `.env.example` and fill in your MongoDB URI and other environment variables.
3. Install dependencies:
   `npm install`

4. Run the app in development mode:
   ```
   npm run dev
   ```

## Running with Docker

### Development

Build and run the development container with live reload:

    docker compose -f docker-compose.dev.yml up

### Production

Build and run the production container:

    docker compose up

## API Examples

### Create a new user

**Request**  
`POST /api/users`  
Content-Type: application/json

    {
      "name": "Your Name",
      "email": "your@email.com",
      "birthday": "1990-01-01",
      "timezone": "Asia/Jakarta"
    }

**Response**  
Status: `201 Created`

    {
      "_id": "60b8d6f9f1a4c20017a5b0e7",
      "name": "Your Name",
      "email": "your@email.com",
      "birthday": "1990-01-01T00:00:00.000Z",
      "timezone": "Asia/Jakarta",
      "createdAt": "2025-06-01T10:00:00.000Z",
      "updatedAt": "2025-06-01T10:00:00.000Z"
    }

### Get User by ID

**Request**  
`GET /api/users/{id}`

**Response**  
Status: `200 OK`

    {
      "_id": "60b8d6f9f1a4c20017a5b0e7",
      "name": "Your Name",
      "email": "your@email.com",
      "birthday": "1990-01-01T00:00:00.000Z",
      "timezone": "Asia/Jakarta",
      "createdAt": "2025-06-01T10:00:00.000Z",
      "updatedAt": "2025-06-01T10:00:00.000Z"
    }

If user not found:  
Status: `404 Not Found`

    {
      "error": "User not found"
    }

### Update User

**Request**  
`PATCH /api/users/{id}`  
Content-Type: application/json

    {
      "name": "Mike Wazowski",
      "email": "mike.wazowski@example.com"
    }

**Response**  
Status: `200 OK`

    {
      "_id": "60b8d6f9f1a4c20017a5b0e7",
      "name": "Mike Wazowski",
      "email": "mike.wazowski@example.com",
      "birthday": "1990-01-01T00:00:00.000Z",
      "timezone": "Asia/Jakarta",
      "createdAt": "2025-06-01T10:00:00.000Z",
      "updatedAt": "2025-06-02T08:30:00.000Z"
    }

### Delete User

**Request**  
`DELETE /api/users/{id}`

**Response**  
Status: `204 No Content`

If user not found:  
Status: `404 Not Found`

    {
      "error": "User not found"
    }

## Assumptions & Design Decisions

- **Timezone Handling:** The system assumes user-provided timezones are valid IANA timezone strings. Moment-timezone is used to handle timezone conversions and date comparisons.
- **Birthday Matching:** Birthday check matches month and day only (ignores year).
- **Cron Schedule:** Birthday reminder runs every 15 minutes to accommodate users across all timezones.
- **Database:** MongoDB is used to store user data. The app expects a live MongoDB instance reachable via URI in `.env`.
- **Error Handling:** Validation uses Zod and Mongoose validations with custom error middleware to format responses.

## Limitations

- No user authentication implemented yet — the API is open.
- Birthday reminders only log to console, no external notification or email integration.
- Does not account for leap year birthdays (Feb 29).

## Testing

Run unit and integration tests using:

    npm test
