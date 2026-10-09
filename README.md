# NutritionScanner

## Backend

### development

to start the DB and api server first ensure you have (this)[https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-containers] installed.
If you do not see any containers listed you need to add your user to the docker group
sudo usermod -aG docker "$USER"
relog to apply changes

**Windows**
You will need to install Docker Desktop [https://docs.docker.com/desktop/setup/install/windows-install/].
Just follow the instructions it provides after opening the app.

### Running Containers

Open the docker-compose.yml and click "Run All Services".
![alt text](https://media.discordapp.net/attachments/809126422698000434/1557908850395324457/image.png?ex=6ac9832e&is=6ac831ae&hm=9f52828754b37dfda5ec24af5f9bbfbc1f8879f2e2966c9ead9a713aefb0ac56&=&format=webp&quality=lossless)

On the left-most bar click the bottom icon and make sure the containers are both running. (Red Arrow)
![alt text](https://media.discordapp.net/attachments/809126422698000434/1557908885656965180/image.png?ex=6ac98336&is=6ac831b6&hm=588aa5dcd3419fac05ff34a76b89d965ff1f99cdad7b2901d88cdd79230880ec&=&format=webp&quality=lossless) ![alt text](https://media.discordapp.net/attachments/809126422698000434/1557908871606177913/image.png?ex=6ac98333&is=6ac831b3&hm=e638d1a88a2b8c154853c2b75f875f307d3a6b06a00d219cf26705b180053dcc&=&format=webp&quality=lossless&width=320&height=111)

once you can see the containers all you need to do is start the verify they are running and accessible with
(open data entry)[http://localhost:3001]
(open api health check)[http://localhost:3000/health]

if using a tethered phone ensure that you run either

- ./devScripts/androidTunnel.sh
- adb reverse tcp:3000 tcp:3000
  this will simply bridge the port accross your devices

you will also need to configure .env files for the main project and the backend

#### ./.env

EXPO_PUBLIC_API_URL=http://127.0.0.1:3000 # for actual device
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000 # for simulator

#### ./backend/.env

DB_USER=appuser
DB_PASSWORD=changeme
DB_NAME=appdb
DB_HOST=localhost
DB_PORT=5432

### Production

For production the steps are the same

- docker must be setup wth cli
- data entry must be accessed with ssh port tunnel
- production api url will replace the port bridge
- env files must be modified to secure values (duh)
