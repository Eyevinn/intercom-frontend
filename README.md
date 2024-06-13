# Intercom Frontend

User interface for web based intercom solution.

Frontend application for [Intercom Manager](https://github.com/Eyevinn/intercom-manager/).

## Get Started

Pre-requisites: Node v20, yarn

`yarn` to install packages

`cp .env.local.sample .env.local` to set up local environment (do not skip!)

To use a local manager instance, set `VITE_BACKEND_URL=http://0.0.0.0:8000/`

`yarn dev` to start a dev server

### Manager in Open Source Cloud

To develop against a manager in Open Source Cloud you need to provide a bearer token (service access token) in the Authorization header.

```
% export VITE_BACKEND_URL=https://<instance>.eyevinn-intercom-manager.auto.prod.osaas.io/
% export OSC_ACCESS_TOKEN=<personal-access-token>
```

To obtain the service access token you need your Open Source Cloud personal access token. You find that one in the settings menu in the [user interface](https://app.osaas.io). Get the service access token with the following HTTP request using curl.

```bash
% curl -X 'POST' \
  'https://token.svc.prod.osaas.io/servicetoken' \
  -H 'accept: application/json' \
  -H "x-pat-jwt: Bearer $OSC_ACCESS_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
  "serviceId": "eyevinn-intercom-manager"
}'
{"serviceId":"eyevinn-intercom-manager","token":"<service-access-token>","expiry":1718315617}
```

Then you start the dev server with the `VITE_BACKEND_API_KEY` environment variable set. Either on the comand line or stored in the shell with `export VITE_BACKEND_API_KEY=<service-access-token>`. The token expires after a while so you might need to refresh the token using the same curl command line above.

```bash
% VITE_BACKEND_API_KEY=<service-access-token> yarn dev
```

As the Open Source Cloud platform apply same-origin principle you need to disable that check in your browser when developing locally. Example below on how to start Chrome on MacOS with this check disabled.

```bash
% open -a Google\ Chrome --args --disable-web-security --user-data-dir="/tmp"
```

## Docker Container

Build local Docker image

```
docker build -t intercom-frontend:dev
```

Run container on port 8080 and with intercom manager on https://intercom-manager.dev.eyevinn.technology/

```
docker run --rm -d -p 8080:8080 \
  -e PORT=8080 \
  -e MANAGER_URL=https://intercom-manager.dev.eyevinn.technology/ \
  --name=frontend \
  intercom-frontend:dev
```

Then the app is available at http://localhost:8080/

Stop container

```
docker stop frontend
```

## Contributing

Contributions to are welcome.

### Git Ways of Working

The project uses feature branches, and a [rebase merge strategy](https://www.atlassian.com/git/tutorials/merging-vs-rebasing).

Make sure you have `git pull` set to rebase mode:

`git config pull.rebase true`

Optionally, you can add the `--global` flag to the above command.

To start working on a new feature: `git checkout -b <feature branch name>`.

This project uses [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/#summary).

Read [Using Git with Discipline](https://drewdevault.com/2019/02/25/Using-git-with-discipline.html).

Read [How to Write a Commit Message](https://chris.beams.io/posts/git-commit/).

A commit should:

- contain a single change set (smaller commits are better)
- pass tests, linting, and typescript checks
- not be broken

Along with enabling time saving automation, it enables extremely powerful debug workflows via [git bisect](https://git-scm.com/docs/git-bisect), making bug hunting a matter of minutes. There are a number of articles out there on the magic of bisecting.

Basic structure of a commit message:

```
<type>[optional scope]: <title starting with verb in infinitive>

[optional body]

[optional footer]
```

Try to describe what was added or changed, instead of describing what the code does. Example:

`fix(seek): rewrite calculation in seek module` `// bad, the consumer does not know what issue this fixes`

`fix(seek): stop player from freezing after seek` `// good, the consumer understands what is now working again`

## Support

Join our [community on Slack](http://slack.streamingtech.se) where you can post any questions regarding any of our open source projects. Eyevinn's consulting business can also offer you:

- Further development of this component
- Customization and integration of this component into your platform
- Support and maintenance agreement

Contact [sales@eyevinn.se](mailto:sales@eyevinn.se) if you are interested.

## About Eyevinn Technology

[Eyevinn Technology](https://www.eyevinntechnology.se) is an independent consultant firm specialized in video and streaming. Independent in a way that we are not commercially tied to any platform or technology vendor. As our way to innovate and push the industry forward we develop proof-of-concepts and tools. The things we learn and the code we write we share with the industry in [blogs](https://dev.to/video) and by open sourcing the code we have written.

Want to know more about Eyevinn and how it is to work here. Contact us at work@eyevinn.se!
