# Deployment Architecture & Instructions

## Development Setup
1. Clone monorepo to local machine.
2. Install workspace dependencies: `npm install`
3. Build shared types: `npm run build:shared`
4. Start MongoDB instance.
5. Run database seeder: `npm run seed`
6. Run frontend & backend concurrently: `npm run dev:server` & `npm run dev:client`

## Production Deployment
- **Frontend**: Deploy `client/` build bundle to Vercel or Netlify.
- **Backend API**: Deploy `server/` to Render, Railway, or AWS ECS with environment variables configured.
- **Database**: MongoDB Atlas Cluster with replica set enabled.
- **File Storage**: AWS S3 or Cloudflare R2 bucket with server-side encryption enabled (AES-256).
- **Docker Deployment**: Run `docker-compose up --build -d` for containerized deployment.
