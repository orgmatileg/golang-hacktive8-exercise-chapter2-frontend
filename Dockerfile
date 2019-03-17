FROM node:latest as build

RUN mkdir /usr/src/app
WORKDIR /usr/src/app

ARG baseUrlApi

ENV REACT_APP_API_URL $baseUrlApi
ENV PATH /usr/src/app/node_modules/.bin:$PATH

COPY package.json /usr/src/app/package.json
RUN yarn install --no-lockfile --no-progress --production
RUN yarn global add react-scripts --no-lockfile --no-progress --production
COPY . /usr/src/app

RUN npm run build

FROM nginx:alpine

COPY --from=build /usr/src/app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
