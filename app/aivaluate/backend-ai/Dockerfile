FROM node:20-bullseye

WORKDIR /app/aivaluate/backend-ai

# Install necessary dependencies for Playwright
RUN apt-get update && \
    apt-get install -y \
    netcat-openbsd \
    postgresql-client \
    wget \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libxkbcommon0 \
    xdg-utils \
    libxshmfence1 \
    libgbm-dev \
    libflite1 \
    --fix-missing \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install
RUN npm install cheerio playwright
RUN npx playwright install-deps
RUN npx playwright install chromium webkit

COPY . .

ENV NODE_ENV=development
ENV PATH /app/node_modules/.bin:$PATH

VOLUME ["/app/aivaluate/backend/assignmentSubmissions", "/app/aivaluate/backend-eval/assignmentKeys"]

EXPOSE 9000

CMD ["node", "server.js"]