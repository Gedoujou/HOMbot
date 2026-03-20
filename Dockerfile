FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev
RUN chmod -R 755 /bot

COPY . .

CMD ["node", "index.js"]