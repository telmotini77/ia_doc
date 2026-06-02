FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the configured port
EXPOSE 5170

# Start the application in development mode
CMD ["npm", "run", "dev"]
