FROM node:alpine
WORKDIR /usr/src/app
COPY package*.json index.js db.json ./
RUN npm install
EXPOSE 3333
CMD ["node", "index.js"]
