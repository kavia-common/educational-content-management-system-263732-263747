#!/bin/bash
cd /home/kavia/workspace/code-generation/educational-content-management-system-263732-263747/lms_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

