import {Command, flags} from '@oclif/command'

export default class Deploy extends Command {
  static description = 'Deploy service'

  static flags = {
    help: flags.help({char: 'h'}),
    // flag with a value (-n, --name=VALUE)
    name: flags.string({char: 'n', description: 'name to print'}),
    // flag with no value (-f, --force)
    force: flags.boolean({char: 'f'}),
  }

  static args = [{name: 'service', required: true, description: 'which service'}, {name: 'image',required: true}]

  async run() {
    const {args, flags} = this.parse(Deploy)
    console.log(args)

  }
}
