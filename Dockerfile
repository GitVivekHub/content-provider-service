FROM node:16.20.2 as dependencies
WORKDIR usr/src/app
COPY package*.json  ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
