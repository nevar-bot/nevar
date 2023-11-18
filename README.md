[![Contributors][contributors-shield]][contributors-url]
[![Node][node-shield]][node-url]
[![License][license-shield]][license-url]
[![Stars][stars-shield]][stars-url]

## 🚀 Nevar
Nevar is a simple, lightweight, and fast discord bot built with discord.js and typescript

[![Banner][banner-url]][website-url]


## Authors
- [@1887jonas](https://www.github.com/1887jonas)
## Run
Clone the project
```bash
  git clone https://github.com/nevar-bot/nevar-ts
```

Go to the project directory
```bash
  cd nevar
```

Install dependencies
```bash
  npm install
```

Compile typescript and create all necessary files
```bash
  npm run build
  npm run config
```
Rename the `config-sample.toml` to `config.toml` and fill in with your data

Start the bot
```bash
  npm start // Run in production mode
  npm run start:dev // Run in development mode
```

## Docker
Clone the repository and build the docker image
```bash
git clone https://github.com/nevar-bot/nevar
cd nevar
docker build -t nevar-bot:latest .
```

Start the container. Make sure you have an config.toml in your project directory, to map it to the container's config.
```bash
docker run -d -p 8085:8085 -p 8075:8075 
-v ${PWD}/config.toml:/app/config.toml 
--restart unless-stopped nevar-bot:latest
```

## Feedback
If you have any feedback, please reach out to us at [hello@nevar.eu](mailto:hello@nevar.eu)

## 🔗 Links
[![Discord][discord-shield]][discord-url]
[![X][x-shield]][x-url]
[![Instagram][instagram-shield]][instagram-url]

## License
Distributed under the AGPLv3 License. See `LICENSE` for more information.

[contributors-shield]: https://img.shields.io/github/contributors/nevar-bot/nevar.svg?style=for-the-badge
[contributors-url]: https://github.com/nevar-bot/nevar/graphs/contributors
[node-shield]:https://img.shields.io/badge/NODE-%3E%3D%2020.0.0-2?style=for-the-badge&color=c634f7
[node-url]:https://node.js.org
[license-shield]: https://img.shields.io/github/license/nevar-bot/nevar.svg?style=for-the-badge
[license-url]:https://choosealicense.com/licenses/agpl-3.0/
[stars-shield]:https://img.shields.io/github/stars/nevar-bot/nevar.svg?style=for-the-badge
[stars-url]:https://github.com/nevar-bot/nevar/stargazers
[banner-url]:https://i.imgur.com/AwsvHQ5.png
[website-url]:https://nevar.eu
[instagram-shield]:https://img.shields.io/badge/instagram-E1306C?style=for-the-badge&logo=instagram&logoColor=white
[instagram-url]:https://instagram.com/nevar_eu
[x-shield]:https://img.shields.io/badge/X-000000?style=for-the-badge&logo=twitter&logoColor=white
[x-url]:https://x.com/nevar_eu
[discord-shield]:https://img.shields.io/badge/discord-5865F2?style=for-the-badge&logo=discord&logoColor=white
[discord-url]:https://nevar.eu/support