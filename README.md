bobby
=====

bobby cli

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/bobby.svg)](https://npmjs.org/package/bobby)
[![Downloads/week](https://img.shields.io/npm/dw/bobby.svg)](https://npmjs.org/package/bobby)
[![License](https://img.shields.io/npm/l/bobby.svg)](https://github.com/bobby-cli/bobby/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g bobby
$ bobby COMMAND
running command...
$ bobby (-v|--version|version)
bobby/0.0.0 darwin-x64 node-v10.15.3
$ bobby --help [COMMAND]
USAGE
  $ bobby COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`bobby hello [FILE]`](#bobby-hello-file)
* [`bobby help [COMMAND]`](#bobby-help-command)

## `bobby hello [FILE]`

describe the command here

```
USAGE
  $ bobby hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ bobby hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/hello.ts](https://github.com/bobby-cli/bobby/blob/v0.0.0/src/commands/hello.ts)_

## `bobby help [COMMAND]`

display help for bobby

```
USAGE
  $ bobby help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.1/src/commands/help.ts)_
<!-- commandsstop -->
