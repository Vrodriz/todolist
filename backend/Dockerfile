FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY .swcrc ./

RUN npm ci --only=production

COPY src ./src
COPY prisma ./prisma

RUN npx prisma generate

RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]