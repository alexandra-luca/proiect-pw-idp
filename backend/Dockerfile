FROM node:alpine

WORKDIR "/var/app/backend"

COPY package.json .
RUN npm install

COPY . .

CMD ["npm", "start"]
