#!/bin/sh

tsc

mkdir site
cp ./index.html ./site/

mkdir site/scripts
cp ./scripts/*.js ./site/scripts/

cp -r ./icons ./site/

cp ./xhulogo.png ./site/
