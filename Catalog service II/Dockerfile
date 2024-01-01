FROM node:alpine
WORKDIR /usr/src/app
COPY package*.json index.js db.json ./
RUN npm install
EXPOSE 3334
CMD ["node", "index.js"]
