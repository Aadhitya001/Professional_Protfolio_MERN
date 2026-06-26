# Use official Node LTS image
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files and install root deps (concurrently)
COPY package*.json ./
RUN npm ci

# Install backend and frontend deps
WORKDIR /app/backend
RUN npm ci
WORKDIR /app/frontend
RUN npm ci

# Build the frontend
WORKDIR /app/frontend
RUN npm run build

# Production image
FROM node:20-alpine AS runner
WORKDIR /app

# Copy backend code and built frontend
COPY --from=builder /app/backend ./backend
COPY --from=builder /app/frontend/dist ./frontend/dist
COPY package*.json ./

# Install only production deps for backend
WORKDIR /app/backend
RUN npm ci --only=production

# Expose the backend port (default 5000)
EXPOSE 5000

# Environment variable for production
ENV NODE_ENV=production

# Start the server
CMD ["node", "server.js"]
