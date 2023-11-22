RED='\033[0;31m'
BLUE='\033[0;34m'
GREEN='\033[0;32m'
NC='\033[0m' #
fecha=$(date +%Y%m%d%H%M%S)
rootPath="/var/www/stg.buscoinfo.com.py/htdocs/"
basePath=$rootPath"releases/"
releasePath=$basePath$fecha
repo="git@hulk:tingelmar/gmwebapp.git"
branch="unity"

cancel() {
  echo "${RED}Error -> $1 ${NC}"
  echo "Cleaning $releasePath..."
  rm -rf $releasePath
  echo "${RED}Installation cancelled${NC}"
}

# Creating folder
echo "${BLUE}Creating new release at $releasePath...${NC}"
mkdir $releasePath
if [ $? -ne 0 ]; then
  cancel "Creating release path"
  exit
fi
cd $releasePath

# Cloning repo
echo "${BLUE}Cloning repo...${NC}"
git clone "$repo" "$releasePath" --branch="$branch" --depth="1"
if [ $? -ne 0 ]; then
  cancel "Cloning repo"
  exit
fi

# Composer Install
echo "${BLUE}Installing composer components...${NC}"
composer install --no-interaction --no-dev --prefer-dist -o
if [ $? -ne 0 ]; then
  cancel "Installing composer"
  exit
fi

# Set folders permissions
echo "${BLUE}Setting folders permissions...${NC}"
chmod -R 755 $releasePath
if [ $? -ne 0 ]; then
  cancel "Setting 755"
  exit
fi
chmod -R g+s $releasePath
if [ $? -ne 0 ]; then
  cancel "Setting g+s"
  exit
fi
chown -R operador:operador $releasePath
if [ $? -ne 0 ]; then
  cancel "Setting operador permission"
  exit
fi

# Setup app
echo "${BLUE}Setting up app...${NC}"
mkdir -p app/cache
if [ $? -ne 0 ]; then
  cancel "Creating app/cache"
  exit
fi
mkdir -p app/logs
if [ $? -ne 0 ]; then
  cancel "Creating app/logs"
  exit
fi
rm -rf app/cache/*
if [ $? -ne 0 ]; then
  cancel "Cleaning app/cache"
  exit
fi
rm -rf app/logs/*
if [ $? -ne 0 ]; then
  cancel "Cleaning app/logs"
  exit
fi
rm -f web/app_dev.php
if [ $? -ne 0 ]; then
  cancel "Removing app_dev"
  exit
fi
rm -f web/appbi_dev.php
if [ $? -ne 0 ]; then
  cancel "Removing appbi_dev"
  exit
fi
chmod 777 -R app/cache/
if [ $? -ne 0 ]; then
  cancel "Changing app/cache to 777"
  exit
fi
chmod 777 -R app/logs/
if [ $? -ne 0 ]; then
  cancel "Chaning app/logs to 777"
  exit
fi

# Main Switch
echo "${BLUE}Changing folders...${NC}"
ln -s $releasePath $rootPath"current-temp"
if [ $? -ne 0 ]; then
  cancel "Creating temp current"
  exit 
fi
chown -h operador:operador $rootPath"current-temp"
if [ $? -ne 0 ]; then
  cancel "Setting temp current owner"
  exit 
fi
mv -Tf $rootPath"current-temp" $rootPath"current"
if [ $? -ne 0 ]; then
  echo "${RED} FAILED LAST STEP !! ${NC}"
  exit 
fi

echo "${GREEN}------------------------"
echo "${GREEN}  Deploy successfull!"
echo "${GREEN}------------------------"

