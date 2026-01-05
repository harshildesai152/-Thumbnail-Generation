# Thumbnail Generation Backend

A comprehensive backend API for thumbnail generation system built with Node.js, TypeScript, MongoDB, BullMQ, Redis, and Socket.IO.

## Features

- **User Authentication**: JWT-based authentication with registration and login
- **File Upload**: Multi-file upload support for images and videos
- **Thumbnail Generation**: Automatic thumbnail generation using Sharp (images) and FFmpeg (videos)
- **Queue Processing**: BullMQ-based job queue for processing thumbnails
- **Real-time Updates**: Socket.IO for live status updates
- **File Management**: Organized storage with original files and thumbnails

## Prerequisites

- Node.js 18+
- MongoDB
- Redis
- FFmpeg (for video processing)

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the backend root directory:
   ```env
   NODE_ENV=development
   PORT=3001
   MONGODB_URI=mongodb://localhost:27017/thumbnail_app
   REDIS_URL=redis://localhost:6379
   JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
   JWT_EXPIRE=7d
   UPLOAD_PATH=./uploads
   MAX_FILE_SIZE=100000000
   ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,video/mp4,video/avi,video/mov
   BCRYPT_ROUNDS=12
   FRONTEND_URL=http://localhost:3000
   ```

3. **Start MongoDB and Redis:**
   - MongoDB: Make sure MongoDB is running on localhost:27017
   - Redis: Make sure Redis is running on localhost:6379

## Running the Application

### Development Mode
```bash
npm run dev
```
This will start the server with hot reloading using ts-node and nodemon.

### Production Mode
```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (requires auth)

### File Upload
- `POST /api/upload` - Upload files (requires auth, multipart/form-data)

### Jobs
- `GET /api/jobs` - Get user's jobs (requires auth)
- `GET /api/jobs/:jobId` - Get specific job details (requires auth)

### Health Check
- `GET /api/health` - Server health check

## Socket.IO Events

### Client to Server
- `join-user` - Join user's room for real-time updates

### Server to Client
- `job-update` - Real-time job status updates

## Project Structure

```
backend/
├── src/
│   ├── config/          # Database, Redis, and queue configurations
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── services/        # Business logic services
│   ├── workers/         # BullMQ workers
│   ├── utils/           # Utility functions
│   ├── app.ts           # Express app setup
│   └── server.ts        # Server startup
├── uploads/             # File storage
│   ├── originals/       # Original uploaded files
│   └── thumbnails/      # Generated thumbnails
├── package.json
├── tsconfig.json
└── README.md
```

## Supported File Types

### Images
- JPEG
- PNG
- GIF

### Videos
- MP4
- AVI
- MOV

## Thumbnail Specifications

- **Size**: 128x128 pixels
- **Format**: JPEG
- **Quality**: 85%
- **Video thumbnails**: Captured from middle of video

## Security Features

- JWT authentication
- Rate limiting
- File type validation
- File size limits
- CORS protection
- Helmet security headers

## Queue Processing

The system uses BullMQ with Redis for job queuing:

- **Per-user FIFO ordering**: Each user's jobs are processed sequentially
- **Job states**: pending → queued → processing → completed/failed
- **Real-time updates**: Socket.IO broadcasts job status changes
- **Error handling**: Failed jobs are logged and marked appropriately

## Development

### Scripts
- `npm run dev` - Start development server with hot reloading
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run worker` - Run worker process (if separated)

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | development |
| `PORT` | Server port | 3001 |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/thumbnail_app |
| `REDIS_URL` | Redis connection string | redis://localhost:6379 |
| `JWT_SECRET` | JWT signing secret | (required) |
| `JWT_EXPIRE` | JWT expiration time | 7d |
| `MAX_FILE_SIZE` | Maximum file size in bytes | 100000000 |
| `ALLOWED_FILE_TYPES` | Comma-separated allowed MIME types | image/jpeg,image/png,image/gif,video/mp4,video/avi,video/mov |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:3000 |

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env`

2. **Redis Connection Error**
   - Ensure Redis is running
   - Check Redis URL in `.env`

3. **FFmpeg Not Found**
   - Install FFmpeg on your system
   - Ensure it's in your PATH

4. **File Upload Issues**
   - Check file size limits
   - Verify allowed file types
   - Ensure upload directories exist

### Logs

Check the following log files:
- `logs/error.log` - Error logs
- `logs/combined.log` - All logs
- Console output for development

## Contributing

1. Follow TypeScript best practices
2. Add proper error handling
3. Write meaningful commit messages
4. Test thoroughly before submitting

## License

This project is licensed under the ISC License.
