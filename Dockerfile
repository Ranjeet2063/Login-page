FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install --prefix backend --omit=dev
EXPOSE 5000
CMD ["npm", "--prefix", "backend", "start"]
