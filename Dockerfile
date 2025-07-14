FROM nginx:1.29.0
ARG PORT=8080
ARG MANAGER_URL
EXPOSE $PORT
EXPOSE $MANAGER_URL

RUN apt-get update
RUN apt-get install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_21.x | bash -
RUN apt-get install -y nodejs
RUN npm install -g yarn
RUN mkdir /app
WORKDIR /app

COPY . .
RUN yarn --immutable

COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf
RUN chmod +x /app/scripts/entrypoint.sh

ENV NODE_ENV production
ENTRYPOINT [ "/app/scripts/entrypoint.sh" ]
