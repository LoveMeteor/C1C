#!/bin/bash

# Support debugging the container
if [[ -n "${DOCKER_DEBUG}" ]]; then set ${DOCKER_DEBUG}; fi
trap 'echo [TIMING `date +"%F %R:%S"`] Container complete; exit ${RESULT:-1}' EXIT SIGHUP SIGINT SIGTERM
echo [TIMING `date +"%F %R:%S"`] Container started

# Decrypt password if present
if [[ (-n "${MONGO_PASSWORD}") && (-n "${REGION}") ]]; then
    base64 -d <<< "${MONGO_PASSWORD}" > /app/ciphertext.bin
    MONGO_PLAINTEXT=$(aws --region ${REGION} --output text kms decrypt \
            --query Plaintext \
            --ciphertext-blob "fileb:///app/ciphertext.bin" | base64 -d)
    export MONGO_URL="${MONGO_URL/<password>/${MONGO_PLAINTEXT}}"

    # Write it out to assist in debugging
    echo "password=${MONGO_PLAINTEXT}" > /app/mongo_connection.txt
    echo "url=${MONGO_URL}" >> /app/mongo_connection.txt
fi

# Define the settings file location
SETTINGS_FILE=/app/settings.json

# Formulate the jq filter expression
FILTER="."

# Add optional configuration settings
if [[ "${APPLY_FIXTURES}" == "true" ]]; then
    FILTER="${FILTER}|.fixtures.apply=true"
fi
if [[ "${RESET_DATABASE}" == "true" ]]; then
    FILTER="${FILTER}|.fixtures.resetDatabase=true"
fi
if [[ "${EXIT_AFTER_RUN}" == "true" ]]; then
    FILTER="${FILTER}|.fixtures.exitAfterRun=true"
fi
if [[ (-n "${BUCKET}") && (-n "${REGION}") ]]; then
    FILTER="${FILTER}|.amazon.s3Bucket=\"${BUCKET}\""
    FILTER="${FILTER}|.amazon.region=\"${REGION}\""
fi

# Now invoke jq to do the work
echo ${SETTINGS} | jq \
"${FILTER}" > ${SETTINGS_FILE}

# Load the settings into the required environment variable
export METEOR_SETTINGS=$(jq -c "." ${SETTINGS_FILE})

if [[ -n "${TASK}" ]]; then
    # Run one off tasks, each separated by ";"
    IFS=';' read -ra CMDS <<< "${TASK}"
    for CMD in "${CMDS[@]}"; do
        echo [TIMING `date +"%F %R:%S"`] Starting task \"${CMD}\"
        ${CMD}
        RESULT=$?
        if [[ "${RESULT}" -ne 0 ]]; then
            exit
        fi
    done
else
    if [[ -n "${DOCKER_DEBUG}" ]]; then
        # Loop until killed
        node /app/main.js
        while true; do
            sleep 5
        done
    else
        # Replace the startup script with node so it with receive signals as pid 1
        exec "$@"
    fi
fi

# All good
RESULT=0
