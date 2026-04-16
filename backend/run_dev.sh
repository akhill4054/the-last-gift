#!/usr/bin/env bash
sam build --no-cached
nodemon --watch lambda_function --watch template.yaml --watch app --ignore .aws-sam --ext py,yaml,yml --exec "export DYLD_LIBRARY_PATH=/opt/homebrew/opt/expat/lib:$DYLD_LIBRARY_PATH && sam build  && sam local start-api --env-vars env.json --debug"
