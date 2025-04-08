# Use Node.js LTS version
FROM node:20-slim

# Create app directory
WORKDIR /workspace

# Update npm to latest version
RUN npm install -g npm@latest

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy app source
COPY . .

# Expose port
EXPOSE 8080

# Start the application
CMD ["node", "src/index.js"] 