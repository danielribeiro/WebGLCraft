#!/bin/bash
set -e
echo Releasing
cp lib/*.coffee .
coffee --map -c *.coffee
echo done
