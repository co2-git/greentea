#!/bin/bash

if [ ! -f "./package.json" ]; then
  echo 'Missing package json';
  exit 1;
fi

if ! grep 1>/dev/null 2>&1 '"name": "quinto"' package.json; then
  echo 'Wrong package json';
  exit 2;
fi

function start() {
  startMongo
  startHTTP
}

function stop() {
  stopHTTP
  stopMongo
}

function startHTTP () {
  if [ -s lock.pid ]; then
    echo HTTP server already started with pid $(cat lock.pid)
    return 3
  else
    # Start HTTP server
    dependencies/nvm/v0.10.25/bin/node server &

    echo "$!" > lock.pid
  fi
}

function stopHTTP () {
  if [ -s lock.pid ]; then
    if kill -9 $(cat lock.pid); then
      echo HTTP server stopped
      : > lock.pid
    else
      echo Could not stop http server
    fi
  else
    echo 'HTTP server already stopped'
  fi
}

function startMongo () {
  if [ -s data/mongod.lock ]; then
    echo MongoDB server already started with pid $(cat data/mongod.lock)
    return 3
  else
    # Start MongoDB
    dependencies/mongodb/bin/mongod --dbpath data --port 3079 &
  fi
}

function stopMongo () {
  if [ -s data/mongod.lock ]; then
    dependencies/mongodb/bin/mongod --dbpath data --shutdown
    echo 'MongoDB stopped';
  else
    echo 'MongoDB already stopped'
  fi
} 

function home() {
  version=$(cat package.json |
    grep version |
    sed -e 's/"version": "\(.\+\)",/\1/' |
    sed -e 's/\s//g'
    )
  
  echo "quinto v$version"

  [ -s lock.pid ] && {
    echo "HTTP server started with pid $(cat lock.pid)"
  } || {
    echo "HTTP server is stopped"
  }

  [ -s data/mongod.lock ] && {
    echo "Mongo server started with pid $(cat data/mongod.lock)"
  } || {
    echo "Mongo server is stopped"
  }
}

function build () {
  dependencies/nvm/v0.10.25/bin/node node_modules/.bin/browserify public/js/index.js > public/bundle.js
}

case "$1" in
  ( build )
    build
    exit $$
    ;;

  ( start )
    start
    exit $$
    ;;

  ( stop )
    stop
    exit $$
    ;;

  ( restart )
    stop
    start
    exit $$
    ;;

  ( start-mongo )
    startMongo
    exit $$
    ;;

  ( start-http )
    startHTTP
    exit $$
    ;;

  ( stop-mongo )
    stopMongo
    exit $$
    ;;

  ( stop-http )
    stopHTTP
    exit $$
    ;;

  ( restart-mongo )
    stopMongo
    startMongo
    exit $$
    ;;

  ( restart-http )
    stopHTTP
    startHTTP
    exit $$
    ;;

  ( * )
    home
    exit $$
    ;;
esac

    