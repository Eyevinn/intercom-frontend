[![Slack](https://slack.osaas.io/badge.svg)](https://slack.osaas.io)

# Eyevinn Open Intercom Client

> _Part of Eyevinn Open Intercom Solution_

[![Badge OSC](https://img.shields.io/badge/Evaluate-24243B?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTIiIGZpbGw9InVybCgjcGFpbnQwX2xpbmVhcl8yODIxXzMxNjcyKSIvPgo8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSI3IiBzdHJva2U9ImJsYWNrIiBzdHJva2Utd2lkdGg9IjIiLz4KPGRlZnM%2BCjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQwX2xpbmVhcl8yODIxXzMxNjcyIiB4MT0iMTIiIHkxPSIwIiB4Mj0iMTIiIHkyPSIyNCIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBzdG9wLWNvbG9yPSIjQzE4M0ZGIi8%2BCjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzREQzlGRiIvPgo8L2xpbmVhckdyYWRpZW50Pgo8L2RlZnM%2BCjwvc3ZnPgo%3D)](https://app.osaas.io/browse/eyevinn-intercom-manager)

Eyevinn Open Intercom is a low latency, web based, open source, high quality, voice-over-ip intercom solution.
It is designed to be used in broadcast and media production environments, where low latency and high quality audio are critical.
The solution is built on top of WebRTC technology and provides a user-friendly interface for managing intercom channels and users.

## Requirements

- [Open Intercom Server](https://github.com/Eyevinn/intercom-manager/) running and reachable

## Hosted Solution

Available as an open web service in [Eyevinn Open Source Cloud](https://www.osaas.io). Read this [documentation to quickly get started](https://docs.osaas.io/osaas.wiki/Service%3A-Intercom.html) with the hosted solution.

## Get Started

Pre-requisites: [Node v20](https://nodejs.org/), [Yarn Classic](https://classic.yarnpkg.com/)

`yarn` to install packages

`cp .env.local.sample .env.local` to set up the local environment (do not skip!)

To use a local [Open Intercom Server](https://github.com/Eyevinn/intercom-manager/), set the environment variable `VITE_BACKEND_URL=http://0.0.0.0:8000/`

Decide whether or not debug mode should be on or not `VITE_DEBUG_MODE=true`

Choose desired level of logging `VITE_DEV_LOGGER_LEVEL=3`

```
LOGGER LEVELS
0 = no logs
1 = basic logs
2 = colored logs
3 = data logs
```

`yarn dev` to start a dev server

### Preview

<img width="2329" height="1276" alt="image" src="https://github.com/user-attachments/assets/c784ac70-2caa-4bca-9a1d-4d0ef883b7bb" />

### Open Intercom Server in Open Source Cloud

To develop using a server hosted by [Open Source Cloud](https://www.osaas.io/), you need to provide a bearer token (service access token) in the Authorization header. The environment should be set to:

```
export VITE_BACKEND_URL=https://<instance>.eyevinn-intercom-manager.auto.prod.osaas.io/
export OSC_ACCESS_TOKEN=<personal-access-token>
```

The `<personal-access-token>` is found in the settings menu in the [user interface](https://app.osaas.io). To get the service access token you run the following command in your terminal.

```bash
% npx -y @osaas/cli service-access-token eyevinn-intercom-manager
<service-access-token>
```

If you are developing against an intercom manager in OSC dev environment you use the `<personal-access-token>` that you have in the development environment and run the following instead.

```bash
% npx -y @osaas/cli --env dev service-access-token eyevinn-intercom-manager
<service-access-token>
```

You also need to update the `VITE_BACKEND_URL` to point to your instance in OSC dev.

```bash
export VITE_BACKEND_URL=https://<instance>.eyevinn-intercom-manager.auto.dev.osaas.io/
```

Then you start the dev server with the `VITE_BACKEND_API_KEY` environment variable set. Either on the comand line or stored in the shell with `export VITE_BACKEND_API_KEY=<service-access-token>`. The token expires after a while so you might need to refresh the token using the same command above.

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

Run container on port 8000 and with intercom manager on `https://<intercom-manager-url>/`

```
docker run --rm -d -p 8000:8000 \
  -e PORT=8000 \
  -e MANAGER_URL=https://<intercom-manager-url>/ \
  --name=frontend \
  intercom-frontend:dev
```

Then the app is available at http://localhost:8000/

Stop container

```
docker stop frontend
```

## Contributing

Contributions are welcome.

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

Join our [community on Slack](https://slack.osaas.io/) where you can post any questions regarding any of our open source projects. Eyevinn's consulting business can also offer you:

- Further development of this component
- Customization and integration of this component into your platform
- Support and maintenance agreement

Contact [sales@eyevinn.se](mailto:sales@eyevinn.se) if you are interested.

## About Eyevinn Technology

[Eyevinn Technology](https://www.eyevinntechnology.se) help companies in the TV, media, and entertainment sectors optimize costs and boost profitability through enhanced media solutions.
We are independent in a way that we are not commercially tied to any platform or technology vendor. As our way to innovate and push the industry forward, we develop proof-of-concepts and tools. We share things we have learn and code as open-source.

With Eyevinn Open Source Cloud we enable to build solutions and applications based on Open Web Services and avoid being locked in with a single web service vendor. Our open-source solutions offer full flexibility with a revenue share model that supports the creators.

Read our blogs and articles here:

- [Developer blogs](https://dev.to/video)
- [Medium](https://eyevinntechnology.medium.com)
- [OSC](https://www.osaas.io)
- [LinkedIn](https://www.linkedin.com/company/eyevinn/)

Want to know more about Eyevinn, contact us at info@eyevinn.se!
