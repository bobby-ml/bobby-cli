import { Command, flags } from '@oclif/command'
var inquirer = require("inquirer");
import cli from 'cli-ux';

import { Storage } from '@google-cloud/storage';
import { Exec } from '../../service/misc';
import Gcloud, { GcpProject } from '../../service/gcloud';
const storage = new Storage();
storage.createBucket

export default class CreateService extends Command {
  static description = 'Service'

  questions = [
    {
      type: 'input',
      name: 'name',
      message: "What is the new service name"
    },
    {
      type: 'input',
      name: 'url',
      message: "What is that the service should respond url",
    },
  ];



  InitAndCheckProject = async (): Promise<any> => {
    const { args, flags } = this.parse(CreateService)
    var token = ""
    try {
      token = await Exec("gcloud auth application-default print-access-token")
      token = token.replace(/\r?\n|\r/g, '')
      const gc = new Gcloud(token);
      var project = await gc.getBobbyProject()
      project.token = token;
      return project
    } catch {
      return null
    }
  }



  async run() {
    const { args, flags } = this.parse(CreateService)
    var answers = await inquirer.prompt(this.questions)
    await cli.confirm("Valid your anwser, continue y/N")
    cli.action.start("Init cli and gcloud")

    var project = await this.InitAndCheckProject()
    if (!project) {
      cli.action.stop("Please init a bobby before")
    }
    var gc = new Gcloud(project.token)
    var bucket = await gc.getBucket(project.projectId)
    var config = await gc.getConfig(bucket.id)

    cli.action.stop()

    cli.action.start('Save new service')
    var find = config.services.find((s: any) => s.name == answers.name || s.url - answers.url)
    if (find) {
      cli.action.stop('service already exist')
    }
    config.services.push(answers)
    gc.putConfig(bucket.id, config)
    cli.action.stop()
  }
}
