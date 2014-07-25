#!/bin/bash

cd $1
git add ./h/*
git add ./m/*
git commit -am "New mark, $2"
git push box master
