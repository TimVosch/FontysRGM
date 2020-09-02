FROM node:12

EXPOSE 3000

WORKDIR /opt/app

COPY package.json .
COPY yarn.lock .

RUN yarn install --pure-lockfile

COPY . .

RUN yarn build \
  && yarn install --production --pure-lockfile

CMD ["node", "dist/server.bundle.js"]