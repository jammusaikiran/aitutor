# Use Node base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all source code
COPY . .

# Expose Vite dev port
EXPOSE 5173

# Run Vite dev server (host 0.0.0.0)
CMD ["npm", "run", "dev"]
