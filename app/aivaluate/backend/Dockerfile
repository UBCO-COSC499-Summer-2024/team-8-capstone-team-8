FROM node:20.14.0-buster as build

# Set the working directory
WORKDIR /app/aivaluate/backend

# Install necessary packages
RUN apt-get update && \
    apt-get install -y netcat-openbsd postgresql-client && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Verify installation of netcat
RUN which nc && nc -h

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install nodemailer
RUN npm install
RUN npm install express multer


# Copy the application code
COPY . .

# Check the directory structure for debugging
RUN ls -la /app/aivaluate/backend

# Check if jest.config.js and logger.js exist for debugging
RUN ls -la /app/aivaluate/backend/jest.config.js
RUN ls -la /app/aivaluate/backend/logger.js



# Create necessary directories and set permissions
RUN mkdir -p /app/aivaluate/backend/assignmentSubmissions && \
    chmod -R 777 /app/aivaluate/backend/assignmentSubmissions




# Add a non-root user and change ownership of the necessary directories
RUN useradd -m myuser && chown -R myuser:myuser /app
USER myuser

# Expose the necessary port
EXPOSE 4000

# Command to run the application
CMD ["sh", "-c", "echo 'DB_HOST: $DB_HOST'; echo 'DB_PORT: $DB_PORT'; while ! nc -z $DB_HOST $DB_PORT; do sleep 1; done && npm test -- --coverage --coverageReporters=text && node server.js"]