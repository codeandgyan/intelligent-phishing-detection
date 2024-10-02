# Get the latest version of Ubuntu
FROM ubuntu

# Get the latest version of Node
FROM node

# Install Playwright
RUN npx -y playwright@1.45.1 install --with-deps

# Set environment variables
ENV NODE_ENV=production \
    PORT=8000 \
    DATA_SOURCE=good \
    START_INDEX=0 \
    END_INDEX=20 

# Override environment variables with build arguments
ARG NODE_ENV
ARG PORT
ARG DATA_SOURCE
ARG START_INDEX
ARG END_INDEX

ENV NODE_ENV=${NODE_ENV} \
PORT=${PORT} \
DATA_SOURCE=${DATA_SOURCE} \
START_INDEX=${START_INDEX} \
END_INDEX=${END_INDEX} 

# Set the working directory in the container
# WORKDIR /app

# Get the latest version of Playwright
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy all local files to the container's working directory
COPY . .

ENTRYPOINT [ "node", "server.js" ]