FROM node:16.20.2 as dependencies
WORKDIR /app
COPY package*.json  ./
RUN npm install
COPY . .
RUN apt-get update && apt-get install -y wkhtmltopdf
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
