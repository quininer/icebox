#!/bin/bash

cd $1
git add .
git commit -am "New mark, $2"
git push box master
