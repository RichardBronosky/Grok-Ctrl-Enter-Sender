#!/usr/bin/env bash

bash tools/paste.sh | \
  bash tools/console-filter.sh | \
  bash tools/paste.sh
bash tools/paste.sh
