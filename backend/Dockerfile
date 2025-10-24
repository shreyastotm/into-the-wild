FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./

# Install backend dependencies
RUN npm ci

# Copy backend source code
COPY backend/src/ ./src/
COPY backend/tsconfig.json ./tsconfig.json

# Build the backend application
RUN npm run build

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "start"]

