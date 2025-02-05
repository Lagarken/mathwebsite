FROM node:20.16.0

WORKDIR /usr/local/ccported


# Proxy server

COPY server/package.json /usr/local/ccported/

RUN npm install

COPY server/client.js /usr/local/ccported/
COPY server/index.js /usr/local/ccported/
ENV node_env=production
ENV port=3000

# Static files
# install nginx
RUN apt-get update && apt-get install -y nginx

# remove the default config file
RUN rm /etc/nginx/sites-enabled/default

# copy the config file from the current directory and paste it inside the container
COPY server/nginx.conf /etc/nginx/sites-enabled/

# copy the static files from the static directory and paste it inside the container
COPY /static /usr/share/nginx/html

# expose the port
EXPOSE 80


# Start nginx and node
CMD ["sh", "-c", "service nginx start && node index.js"];