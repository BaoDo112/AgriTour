FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# mysql2 is included in production deps; rebuild ensures native bindings are prepared in-image.
RUN apk add --no-cache python3 make g++ wget \
	&& npm ci --only=production \
	&& npm rebuild mysql2 --build-from-source \
	&& npm cache clean --force \
	&& apk del python3 make g++

COPY . .

EXPOSE 3002

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
	CMD wget --no-verbose --tries=1 --spider http://localhost:3002/health || exit 1

CMD ["node", "server.js"]
