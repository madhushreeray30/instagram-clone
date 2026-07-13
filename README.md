# Instagram Clone

A production-grade Instagram clone built with Node.js, Express, TypeORM, PostgreSQL, React, and TypeScript.

## Project Structure

```
├── backend/              # Node.js/Express backend
│   ├── src/
│   │   ├── controllers/  # API controllers
│   │   ├── services/     # Business logic
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Express middleware
│   │   ├── models/       # TypeORM entities
│   │   ├── utils/        # Utility functions
│   │   └── config/       # Configuration
│   ├── database/
│   │   └── migrations/   # TypeORM migrations
│   └── tests/            # Test files
├── frontend/             # React/TypeScript frontend
│   ├── src/
│   │   ├── pages/        # Page components
│   │   ├── components/   # Reusable components
│   │   ├── store/        # Redux store
│   │   ├── services/     # API client
│   │   ├── utils/        # Utility functions
│   │   └── styles/       # CSS and Tailwind
│   └── public/           # Static assets
└── docker-compose.yml    # Container orchestration
```

## Prerequisites

- Node.js v18+
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+
- npm or yarn

## Quick Start (Docker)

```bash
# Clone the repository
git clone <repo-url>
cd instagram-clone

# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Start services with Docker Compose
docker-compose up -d

# Wait for services to be ready
sleep 10

# Run migrations
docker-compose exec backend npm run migration:run

# Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# API Docs: http://localhost:5000/api-docs
```

## Local Development (Without Docker)

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
# Make sure PostgreSQL and Redis are running locally

# Run migrations
npm run migration:generate
npm run migration:run

# Start development server
npm run dev
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev
```

## Environment Variables

### Backend (.env)

Required variables:
- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`
- `REDIS_HOST`, `REDIS_PORT`
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME`
- `EMAIL_USER`, `EMAIL_PASSWORD`
- `FRONTEND_URL`

### Frontend (.env)

Required variables:
- `VITE_API_URL`: Backend API base URL
- `VITE_SOCKET_URL`: WebSocket server URL

## Database Schema

The application includes 12 main tables:
- Users
- Posts
- Likes
- Comments
- Follows
- Messages
- Conversations
- Notifications
- Stories
- Story_Views
- Hashtags
- Post_Hashtags

## API Documentation

Once the backend is running, access the Swagger API documentation at:
```
http://localhost:5000/api-docs
```

## Testing

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run tests with coverage
npm test:cov

# Run tests in watch mode
npm test:watch
```

### Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run tests with coverage
npm test:cov

# Run tests in watch mode
npm test:watch
```

## Phase 1 Features

### Authentication
- User registration with email validation
- Login with email/password
- JWT token-based authentication
- Email verification with OTP
- Password reset functionality
- Logout

### User Profiles
- View user profiles
- Edit profile information
- Follow/unfollow users
- View followers/following
- Private/public account toggle

### Posts
- Create posts (1-10 images)
- View home feed
- Edit post captions
- Delete posts
- Post detail page

### Social Interactions
- Like/unlike posts
- Comment on posts
- Edit/delete comments
- Reply to comments

### Real-Time Features
- WebSocket integration
- Live like counts
- Live comments
- Follow notifications
- Real-time feed updates

## Security Features

- Bcrypt password hashing (12 rounds)
- JWT token-based authentication
- CSRF protection
- Rate limiting
- XSS protection
- SQL injection prevention (via TypeORM)
- Input validation with Joi
- Secure headers with Helmet
- CORS configuration

## Performance Targets

### Frontend
- FCP: < 1.5s
- LCP: < 2.5s
- TTI: < 3s
- Bundle: < 150KB (gzipped)
- Lighthouse: > 90

### Backend
- API response (p95): < 200ms
- DB query (p95): < 100ms
- Feed load: < 500ms
- Cache hit rate: > 80%

## Deployment

### Build Production Images

```bash
docker-compose -f docker-compose.yml build

# Tag for registry
docker tag instagram-clone-backend:latest <registry>/instagram-backend:latest
docker tag instagram-clone-frontend:latest <registry>/instagram-frontend:latest

# Push to registry
docker push <registry>/instagram-backend:latest
docker push <registry>/instagram-frontend:latest
```

### Environment for Production

1. Update all `.env` files with production values
2. Ensure HTTPS/SSL is configured
3. Set `NODE_ENV=production`
4. Configure AWS credentials and S3 bucket
5. Set strong JWT secrets
6. Enable database SSL
7. Configure CloudFront CDN

## Git Workflow

### Branches
- `main`: Production-ready code
- `develop`: Integration branch
- `feature/*`: Feature branches
- `hotfix/*`: Bug fixes

### Commit Convention
```
feat(scope): description
fix(scope): description
refactor(scope): description
test(scope): description
docs(scope): description
```

## Code Quality

### Linting

```bash
# Backend
cd backend && npm run lint

# Frontend
cd frontend && npm run lint

# Fix linting issues
cd backend && npm run lint:fix
cd frontend && npm run lint:fix
```

### Type Checking

Both backend and frontend use TypeScript with strict mode enabled.

## Troubleshooting

### Database Connection Error
```bash
# Ensure PostgreSQL is running
# Check DB credentials in .env
# Verify database exists
psql -U postgres -d postgres -c "SELECT 1"
```

### Redis Connection Error
```bash
# Ensure Redis is running
# Check Redis host/port in .env
# Test connection
redis-cli ping
```

### Port Already in Use
```bash
# Find and kill process using port
lsof -i :5000  # backend
lsof -i :3000  # frontend
lsof -i :5432  # postgres
```

## Contributing

1. Create feature branch: `git checkout -b feature/feature-name`
2. Commit changes: `git commit -am 'feat(scope): description'`
3. Push branch: `git push origin feature/feature-name`
4. Submit pull request

## License

MIT

## Support

For issues and questions, please create an issue in the repository.
