#!/usr/bin/env bash

kill -9 `lsof -t -i:8000`
kill -9 `lsof -t -i:9000`

cd ./publisher; npm run dev & cd ..
cd ./subscriber; npm run dev &
