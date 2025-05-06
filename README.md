# CNAD
# Cpanel NODE auto deployment

CNAD is a package to manage auto deployment of nodejs application on cpanel

> Insatllation
```bash
npm i @bitc/cnad
```

# How it works
It watches your `package.json` file, once there is a changes. it install your dependencies and restart the server.

very simple right? 🙂🤩 yea.

> Your nodejs on cpanel must be running with persenger.
> You don't need to worry all nodejs on cpanel already running with it.

# Example
```js
//server.js
const cnad = require("@bitc/cnad");

cnad.config("/home/user/nodevenv/site_file_root/node_version");

// Make CNAD listen for other files to restart the server
cnad.watch(["path/to/different/restart/file.txt", "another/path/to/restart/file.txt"]);

cnad.start();
```

> Find your path to npm
![npm path](https://user-images.githubusercontent.com/52476329/189543876-7e0e2358-7004-4af3-b083-ffdc8b4bb6ff.png)


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
            uses: actions/checkout@v4

          - name: Use Node.js 20.x
            uses: actions/setup-node@v4
            with:
              node-version: 20

          - name: Install dependencies
            run: npm ci

          - name: Build project
            run: npm run build

          - name: List directory contents
            run: ls -la

          - name: Upload .next folder
            uses: actions/upload-artifact@v4
            with:
              name: dot_next_folder
              path: .next/
              if-no-files-found: warn
              include-hidden-files: true

  web-deploy:
      name: 🎉 Deploy
      runs-on: ubuntu-latest
      needs: [build]

      steps:
          - name: Clone repository
            uses: actions/checkout@v4

			# Important step, this is use to restart your server
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

  build:
      name: Build
      runs-on: ubuntu-latest
      
      steps:
          - name: Clone repository
            uses: actions/checkout@v4

          - name: Use Node.js 20.x
            uses: actions/setup-node@v4
            with:
              node-version: 20

          - name: Install dependencies
            run: npm ci

          - name: Build project
            run: npm run build

          - name: List directory contents
            run: ls -la

          - name: Upload .next folder
            uses: actions/upload-artifact@v4
            with:
              name: dot_next_folder
              path: .next/
              if-no-files-found: warn
              include-hidden-files: true

  web-deploy:
      name: 🎉 Deploy
      runs-on: ubuntu-latest
      needs: [build]

      steps:
          - name: Clone repository
            uses: actions/checkout@v4

    # Important step, this is use to restart your server
          - name: Creating restart file
            run: |
              mkdir tmp && touch tmp/restart.txt 
              echo $RANDOM > tmp/restart.txt

          - name: download .next folder
            uses: actions/download-artifact@v4
            with:
              name: dot_next_folder
              path: .next

    # Using FTP to upload your files to cpanel
          - name: 📂 Sync files
            uses: SamKirkland/FTP-Deploy-Action@v4.3.5
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
                  postcss.config.js
                  tailwind.config.js
                  README.md
                  .gitignore
                  .gitignore.swp
                  yarn.lock
                  next.config.js
```

> Now you should be getting how to create your custom workflow

Workflow depends on what you need to build and what type of application
you are running but this package will help you install your dependencies and restart your server for you.


