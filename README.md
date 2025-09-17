# Pinterest Automation Tool

A comprehensive Pinterest automation tool built with Next.js, TypeScript, and Material UI. This application allows you to schedule Pinterest pins, manage boards, and integrate with external systems through a secure API.

## Features

- 🔐 **OAuth2 Authentication** - Secure Pinterest login using official Pinterest API
- 📅 **Scheduled Posting** - Schedule pins to be posted at optimal times
- 🔄 **Automated Queue Management** - Background processing with retry logic
- 🌐 **Chrome Extension API** - Add pins from Chrome extension with secure HMAC authentication
- 🔧 **External API Integration** - Add pins from other servers programmatically
- 📊 **Dashboard** - Beautiful Material UI dashboard for managing content
- 🔧 **Board Management** - View and manage your Pinterest boards
- ⚡ **Real-time Status** - Track pin posting status and errors
- 🔒 **Privacy Policy** - Comprehensive privacy policy page with data protection details

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Material UI
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: MySQL
- **Authentication**: NextAuth.js with Pinterest OAuth2
- **Scheduling**: Node-cron for automated posting

## Prerequisites

Before you begin, ensure you have:

1. **Node.js** (v18 or higher)
2. **MySQL** database
3. **Pinterest Developer Account** with API access

## Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd pinterest-automation
npm install
```

### 2. Pinterest Developer Setup

1. Go to [Pinterest Developers](https://developers.pinterest.com/)
2. Create a new app
3. Get your **Client ID** and **Client Secret**
4. Set redirect URI to: `http://localhost:3000/api/auth/callback/pinterest`

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="mysql://username:password@localhost:3306/pinterest_automation"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Chrome Extension API
CHROME_EXTENSION_SECRET="your-chrome-extension-secret"
ALLOWED_EXTENSION_IDS="your-extension-id-1,your-extension-id-2"

# Cron Job Secret (for automated posting)
CRON_SECRET="your-cron-secret"
```

### 4. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push
```

**Note**: Make sure your MySQL database is running and the database `pinterest_automation` exists before running `npm run db:push`.

#### Creating MySQL Database

If you don't have the database created yet, you can create it using MySQL command line:

```sql
CREATE DATABASE pinterest_automation;
```

Or using MySQL Workbench or any MySQL client of your choice.

### 5. Run the Application

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

The application will be available at `http://localhost:3000`

## Usage

### 1. Authentication

1. Visit the homepage
2. Click "Connect with Pinterest"
3. Authorize the application with your Pinterest account
4. You'll be redirected to the dashboard

### 2. Creating Pins

1. Click "Add Pin" on the dashboard
2. Fill in the pin details:
   - Title
   - Description
   - Image URL
   - Link (optional)
   - Select a board
   - Choose schedule date/time
3. Click "Create Pin"

### 3. Chrome Extension Integration

The application provides a secure API for Chrome extension integration. See `CHROME_EXTENSION_INTEGRATION.md` for detailed implementation guide.

**Key Features:**
- HMAC signature authentication
- Extension ID whitelisting
- Secure pin data transmission

### 4. External API Integration

Use the external API to add pins from other servers:

```bash
curl -X POST http://localhost:3000/api/external/pins \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-id",
    "boardId": "board-id",
    "title": "Pin Title",
    "description": "Pin Description",
    "imageUrl": "https://example.com/image.jpg",
    "link": "https://example.com",
    "scheduledAt": "2024-01-01T12:00:00Z"
  }'
```

### 5. Checking Pin Status

```bash
curl "http://localhost:3000/api/external/status?userId=user-id"
```

## API Endpoints

### Internal API

- `GET /api/pinterest/boards` - Get user's Pinterest boards
- `POST /api/pins/create` - Create a new pin
- `GET /api/pins/queue` - Get pin queue with pagination
- `DELETE /api/pins/[id]` - Delete a pin from queue

### External API

- `POST /api/external/pins` - Add pin from external system
- `GET /api/external/status` - Check pin status

### Cron Jobs

- `POST /api/cron/post-pins` - Process scheduled pins (call this every few minutes)

## Setting Up Automated Posting

### Option 1: Vercel Cron Jobs

If deploying to Vercel, add this to your `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/post-pins",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

### Option 2: External Cron Service

Use a service like [cron-job.org](https://cron-job.org/) to call:
```
POST https://your-domain.com/api/cron/post-pins
Authorization: Bearer your-cron-secret
```

Every 5 minutes.

## Database Schema

The application uses the following main entities:

- **User** - Application users
- **PinterestAccount** - Linked Pinterest accounts
- **PinterestBoard** - User's Pinterest boards
- **PinQueue** - Scheduled pins waiting to be posted

## Security Features

- OAuth2 authentication with Pinterest
- API key authentication for external endpoints
- Token refresh handling
- Input validation with Zod
- SQL injection protection with Prisma

## Troubleshooting

### Common Issues

1. **OAuth Error**: Ensure your Pinterest app redirect URI matches exactly
2. **Database Connection**: Check your DATABASE_URL format and ensure MySQL is running
3. **MySQL Connection**: Verify your MySQL credentials and that the database exists
4. **Token Expired**: The system automatically refreshes tokens
5. **Pin Creation Failed**: Check image URL accessibility and board permissions

### MySQL-Specific Issues

- **Connection Refused**: Ensure MySQL server is running (`sudo service mysql start` on Linux/Mac)
- **Database Not Found**: Create the database first: `CREATE DATABASE pinterest_automation;`
- **Authentication Failed**: Check username/password in DATABASE_URL
- **Port Issues**: Default MySQL port is 3306, ensure it's not blocked

### Logs

Check the console for detailed error messages. The application logs all API calls and errors.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue on GitHub or contact the development team.
