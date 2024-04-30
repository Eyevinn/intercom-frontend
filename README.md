# Intercom Frontend

User interface for web based intercom solution.

Frontend application for [Intercom Manager](https://github.com/Eyevinn/intercom-manager/).

## Get Started

Pre-requisites: Node v20, yarn

`yarn` to install packages

`cp .env.local.sample .env.local` to set up local environment (do not skip!)

To use a local manager instance, set `VITE_BACKEND_URL=http://0.0.0.0:8000/`

`yarn dev` to start a dev server

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
