# CNAD
# Cpanel NODE auto deployment

CNAD is a package to manage auto deployment of nodejs application on cpanel

> Insatllation
```bash
npm i @bitc/cnad
```

# How it works
It watches your `package.json` file, once there is a changes. it install the packges for you and restart the server.

very simple right? 🙂🤩 yea.

> Your nodejs on cpanel must be running with persenger.
> You don't need to worry all nodejs on cpanel already running with it.

# Example
```js
//server,js
const cnad = require("@bitc/cnad");

cnad.config("/home/user/nodevenv/site_file_root/node_version");

cnad.start();
```


Let cnad do the magic. just keep pushing code to your repo and cnad will do the job for you.

But if you push code to repo how will it get to cpanel?

That where you need a workflow. We already have a basic work flow for you. feel free to modify it to your need.

> nextjs application
```yml
on:
    push:
        branches: [ "main" ]

name: 🚀 CNAD

jobs:

    build:
        name: Build
        runs-on: ubuntu-latest
        
        steps:
            - name: Clone repository
              uses: actions/checkout@v3

            - name: Use Node.js 16.x
              uses: actions/setup-node@v3
              with:
                node-version: 16

            - name: Install dependencies
              run: npm ci

            - name: Generate build
              run: npm run build

            - name: Upload .next folder
              uses: actions/upload-artifact@v3
              with:
                name: dot_next_folder
                path: .next/

    web-deploy:
        name: 🎉 Deploy
        runs-on: ubuntu-latest
        needs: [build]

        steps:
            - name: Clone repository
              uses: actions/checkout@v3

			# Important job, this is use to restart your server
            - name: Creating restart file
              run: |
                mkdir tmp && touch tmp/restart.txt 
                echo $RANDOM > tmp/restart.txt

            - name: download .next folder
              uses: actions/download-artifact@v3
              with:
                name: dot_next_folder
                path: .next

			# Using FTP to upload your files to cpanel
            - name: 📂 Sync files
              uses: SamKirkland/FTP-Deploy-Action@4.3.2
              with:
                server: ${{ secrets.FTP_HOST }}
                username: ${{ secrets.FTP_USER }}
                password: ${{ secrets.FTP_PASSWORD }}
                exclude: |
                    **/.next/cache/**
                    **/.github/**
                    **/.git/**
                    pages/**
                    css/**
                    layouts/**
                    components/**
                    lib/**
                    sitedata/**
                    postcss.config.js
                    tailwind.config.js
                    README.md
                    .gitignore
                    .eslintrc.json
```

> You don't need most file in your server after build that why we added some
files to exclude

> express application
```yml
on:
    push:
        branches: [ "main" ]

name: 🚀 CNAD

jobs:

    web-deploy:
        name: 🎉 Deploy
        runs-on: ubuntu-latest
        needs: [build]

        steps:
            - name: Clone repository
              uses: actions/checkout@v3

			# Important step, this is use to restart your server
            - name: Creating restart file
              run: |
                mkdir tmp && touch tmp/restart.txt 
                echo $RANDOM > tmp/restart.txt

			# Using FTP to upload your files to cpanel
            - name: 📂 Sync files
              uses: SamKirkland/FTP-Deploy-Action@4.3.2
              with:
                server: ${{ secrets.FTP_HOST }}
                username: ${{ secrets.FTP_USER }}
                password: ${{ secrets.FTP_PASSWORD }}
                exclude: |
                    **/.github/**
                    **/.git/**
                    README.md
                    .gitignore
                    .eslintrc.json
```

> Now you should be getting how to create your custom workflow

Workflow depends on what you need to build and what type of application
you are running but this package will help you install your dependencies and restart your server for you.


