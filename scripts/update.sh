#!/bin/bash

if [[ $# -ne 1 ]]
then
  echo "Usage: ./update.sh [preview|global]"
  exit 0
fi

if ! [[ -f $(which git) ]]
then
  echo "Git command missing. Installing."
  sudo apt-get install git
fi

if [[ -f config.txt ]]
then
  url=$(cat config.txt)
  wget -q https://ethercalc.org/_/$url/csv -O- | csv2json > ../data/shutdowns.json
else
  echo "Configuration missing. Create 'config.txt' file with ethercalc sheet id."
  exit 1
fi

if [[ $? -eq 0 ]]
then
  echo "Downloaded data from ethercalc."
else
  echo "Failed to download data."
  exit 1
fi

if [[ $1 == "preview" ]]
then
  echo "Launching browser to preview latest available data."
  xdg-open "../index.html"
  exit 0
elif [[ $1 == "global" ]]
then
  echo "Global"
  git diff --quiet ../data/shutdowns.json
  if [[ $? == 1 ]]
  then
    git add "../data/shutdowns.json"
    git commit -m "Updated data on $(date) by $(git config user.name)"
    echo "** Updating the tracker with new data. **"
    git push origin master
  else
    echo "No new data to update. Maybe its already updated from recent attempt."
  fi
  exit 0
fi
