# Use Node.js version 20
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install --frozen-lockfile

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install

# Copy the rest of the Next.js project files
COPY . .
RUN npm run build-client

# Run the install-server command before starting
RUN npm run install-server
RUN npm run install-client

# Expose the default Next.js port
EXPOSE 5000
EXPOSE 3000

# Start the Next.js application
CMD ["npm", "start"]
