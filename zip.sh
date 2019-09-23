#!/usr/bin/env bash 

npm run build
if [ -f src.zip ]; then
  rm src.zip
fi
zip -r src.zip src/
