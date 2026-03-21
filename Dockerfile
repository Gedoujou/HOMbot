FROM node:22
WORKDIR ./
COPY package*.json ./
RUN npm install express
COPY .
EXPOSE 3000
CMD ["npm", "start"]
