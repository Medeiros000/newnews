FROM node:24-slim

WORKDIR /app

COPY package*.json ./
RUN apt-get update \
	&& apt-get install -y --no-install-recommends python3 make g++ \
	&& npm ci \
	&& apt-get purge -y --auto-remove python3 make g++ \
	&& rm -rf /var/lib/apt/lists/*

COPY . .
RUN npx prisma generate

EXPOSE 3000

CMD ["sh", "-c", "npm run db:generate && npm run db:migrate && npm run db:seed && npm run dev"]
