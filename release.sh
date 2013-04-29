#!/bin/bash
set -e
echo Releasing
cp lib/*.coffee .
cp -rf public/* .
coffee --map -c *.coffee
echo done
