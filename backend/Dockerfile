FROM node:20-slim

# Install system dependencies if needed (e.g. for specific native modules or debugging)
# procps is for ps command, useful for debugging
RUN apt-get update && apt-get install -y procps && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files first to leverage cache
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the TypeScript code
RUN npm run build

# Create uploads directory
RUN mkdir -p uploads

# Expose the port the app runs on
EXPOSE 3003

# Start the application
CMD ["npm", "start"]
