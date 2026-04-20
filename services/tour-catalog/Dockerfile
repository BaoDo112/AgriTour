FROM node:20-alpine

WORKDIR /app

# Copy package files và cài đặt thư viện
COPY package*.json ./
RUN npm install --only=production

# Copy toàn bộ code nguồn
COPY . .

# Mở port 3001 theo thiết kế
EXPOSE 3001

# Lệnh kiểm tra sức khỏe hệ thống
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

CMD ["node", "server.js"]