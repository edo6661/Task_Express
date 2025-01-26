FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build:production
EXPOSE 8000
CMD ["npm", "start"]