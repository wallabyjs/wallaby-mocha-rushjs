# wallaby-mocha-rushjs

## Setup

- corepack enable pnpm
- corepack prepare pnpm@6.31.0 --activate
- pnpm i -g @microsoft/rush
- rush update --full --purge
- ln -s $(pwd)/common/temp/node_modules node_modules
- mkdir node_modules/@libs
- ln -s (pwd)/libs/store node_modules/@libs/domain
- ln -s (pwd)/libs/store node_modules/@libs/store

