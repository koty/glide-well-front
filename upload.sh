#!/bin/bash
aws s3 sync ./dist/ s3://glide-well.b-sw.co --delete --profile koty

