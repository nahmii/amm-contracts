#!/bin/sh
# Change to the correct directory
cd /usr/src/app;
# Compile contracts
npm run compile:nvm;
# Deploy contract and generate init hash
npm run deploy-n-generate;
