# 1. Use official Node.js image
FROM node:18

# 2. Set working directory inside the container
WORKDIR /app

# 3. Copy package.json and package-lock.json
COPY package*.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy rest of the app files
COPY . .

# 6. Expose the port your app uses (e.g., 3000)
EXPOSE 5000

# 7. Start the app
CMD ["npm","start"]
