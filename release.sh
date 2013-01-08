#!/bin/bash
set -e
echo Releasing
cp lib/*.coffee .
cp -rf public/* .
coffee --map -c *.coffee
# TODO tag this instead
g co 33dde083c2c2bece4b08cf1b6302ffe9db4f96d3 index.html
echo done
