# Pull base image.
FROM node:4-slim

# Add app directory.
COPY ./dist/bundle /app

# Add the docker startup file
COPY ./docker-entrypoint.sh /app

# Install jq for updating the configuration based on environment variables
RUN apt-get update && apt-get install -y \
    jq \
	&& rm -rf /var/lib/apt/lists/*

# Install aws cli to permit decryption of password
RUN apt-get update && apt-get install -y \
    python python-pip \
    && rm -rf /var/lib/apt/lists/* && pip install --upgrade awscli

# Entrypoint script
ENTRYPOINT ["/app/docker-entrypoint.sh"]

# Define default command - it is exec'd after updating config
CMD ["node", "/app/main.js"]
