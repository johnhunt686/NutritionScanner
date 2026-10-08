# NutritionScanner

## Backend

### development

to start the DB and api server first ensure you have (this)[https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-containers] installed.
If you do not see any containers listed you need to add your user to the docker group
sudo usermod -aG docker "$USER"
relog to apply changes

once you can see the containers all you need to do is start the verify they are running and accessible with
(open data entry)[http://localhost:3001]
(open api health check)[http://localhost:3000/health]

if using a tethered phone ensure that you run either

- ./devScripts/androidTunnel.sh
- adb reverse tcp:3000 tcp:3000
  this will simply bridge the port accross your devices

you will also need to configure .env files for the main project and the backend

#### ./.env

DB_USER=appuser
DB_PASSWORD=changeme
DB_NAME=appdb
DB_HOST=localhost
DB_PORT=5432

#### ./backend/.env

EXPO_PUBLIC_API_URL=http://127.0.0.1:3000 //for actual device
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000 //for simultor

### Production

For production the steps are the same

- docker must be setup wth cli
- data entry must be accessed with ssh port tunnel
- production api url will replace the port bridge
- env files must be modified to secure values (duh)
