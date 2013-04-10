#!/bin/bash
set -e
echo Releasing
cp lib/*.coffee .
coffee --map *.coffee
echo done
