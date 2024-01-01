FROM node:alpine
WORKDIR /usr/src/app
COPY package*.json index.js db.json ./
RUN npm install
EXPOSE 4444
CMD ["node", "index.js"]
