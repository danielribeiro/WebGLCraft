#!/bin/bash
set -e
echo Releasing
cp lib/*.coffee .
cp public/lib/* lib/
coffee --map -c *.coffee
echo done
