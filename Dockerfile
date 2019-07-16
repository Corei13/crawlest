FROM node:10-alpine

EXPOSE 3031

COPY package.json package.json
COPY src src

RUN npm install

CMD node src/index
