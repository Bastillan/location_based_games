FROM node:alpine

WORKDIR /app/frontend/

COPY package*.json /app/frontend/
RUN npm install

COPY . /app/frontend/

CMD ["npm", "start"]