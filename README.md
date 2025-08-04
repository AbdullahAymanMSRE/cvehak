# CVeHak - AI-Powered CV Analysis Platform

A full-stack application that allows users to upload CV files, analyzes them using AI, and provides scoring and insights through a web dashboard.

## Features

- **CV Upload**: Drag-and-drop PDF upload with progress tracking
- **AI Analysis**: GPT-3.5-turbo powered scoring (experience, education, skills)
- **Real-time Updates**: WebSocket integration for live processing status
- **Dashboard**: View all CVs with scores and detailed feedback
- **Authentication**: Secure login with Google OAuth and credentials

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API routes, Prisma, PostgreSQL
- **Storage**: AWS S3 for file storage
- **AI**: OpenAI GPT-3.5-turbo for CV analysis
- **Jobs**: Redis + BullMQ for background processing
- **Real-time**: Socket.IO for WebSocket connections (to be added)

## Setup

### Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL database
- Redis server
- AWS S3 bucket
- OpenAI API key

### Installation

1. **Clone and install dependencies**

   ```bash
   git clone https://github.com/AbdullahAymanMSRE/cvehak.git
   cd cvehak
   pnpm install
   ```

2. **Start Redis**

   ```bash
   brew install redis
   brew services start redis
   ```

3. **Set up environment variables**
   create `.env` file and add content as described below.

4. **Database setup**

   ```bash
   pnpx prisma generate
   pnpx prisma db push
   ```

5. **Start development server**

   ```bash
   pnpm dev
   ```

6. **Start background workers** (in a separate terminal)
   ```bash
   pnpm workers
   ```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Environment Variables

Create `.env` with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/cvehak"

# NextAuth
AUTH_SECRET="your-random-secret-key"
AUTH_URL="http://localhost:3000"

# Google Login
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# AWS S3
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET_NAME="cv-uploads-dev"

# OpenAI
OPENAI_API_KEY="sk-your-openai-api-key"
OPENAI_MODEL="gpt-3.5-turbo"

# Redis
REDIS_URL="redis://localhost:6379"
REDIS_HOST="localhost"
REDIS_PORT="6379"

# File Upload Configuration
MAX_FILE_SIZE_MB="10"  # Maximum file size in MB (default: 10)
# Example: Set to 25MB for larger files
# MAX_FILE_SIZE_MB="25"
```

## API Endpoints

- `POST /api/cv` - Upload CV and trigger analysis
- `DELETE /api/cv/[id]` - Delete CV and associated data
- `GET /api/dashboard` - Get dashboard statistics and recent activity
