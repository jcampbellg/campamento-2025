## Getting Started
First, fill in the .env file with the following content:

``` .env
DATABASE_URL = 
PORT = 3000
SERVICE_KEY = Place google json service key in one line you can use https://www.text-utils.com/json-formatter/ to format it in one line
PROJECT_ID = 
BUCKET_NAME = 
```
Then, run the following command to install the dependencies:

```bash
yarn install
npx prisma generate
```

```bash
yarn dev
```