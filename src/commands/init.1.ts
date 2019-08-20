import { Command, flags } from '@oclif/command'

import cli from 'cli-ux';
import { rejects } from 'assert';
import { get, post } from 'superagent';
import * as inquirer from 'inquirer';

import { Storage, StorageOptions } from '@google-cloud/storage';
import Gcloud from '../service/gcloud';
const emojic = require("emojic");

async function Wait(sec: number): Promise<any> {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, sec * 1000)
  })
}

async function WaitOperationSelfLink(selflink: string, token: string) {
  return new Promise((resolve, reject) => {
    var interval: any
    selflink = selflink
    interval = setInterval(async () => {
      try {
        var res = await get(selflink)
          .set("Authorization", "Bearer " + token)
        console.log("CHECK OPERATION: ", res.body)
        if (res.body.status && res.body.status != "RUNNING") {
          clearInterval(interval);
          resolve()
        }
        if (res.body.done) {
          clearInterval(interval);
          resolve()
        }

      } catch (err) {
        console.log("ERROR: ", err)
      }
    }, 10000)
  })
}

async function Exec(command: string): Promise<any> {
  return new Promise((resolve, rejects) => {
    var exec = require('child_process').exec;
    exec(command, function (error: any, stdout: any, stderr: any) {
      if (error) {
        rejects(error)
      }
      if (stderr) {
        rejects(stderr)
      }
      if (stdout) {
        resolve(stdout)
      }
    });
  })
}

export default class Hello extends Command {
  static description = 'describe the command here'


  static flags = {
    help: flags.help({ char: 'h' }),
    // flag with a value (-n, --name=VALUE)
    name: flags.string({ char: 'n', description: 'name to print' }),
    // flag with no value (-f, --force)
    force: flags.boolean({ char: 'f' }),
  }

  static args = [{ name: 'file' }]

  async run() {
    const { args, flags } = this.parse(Hello)
    cli.action.start("Check gcloud cli")
    var token = ""
    try {
      token = await Exec("gcloud auth application-default print-access-token")
      token = token.replace(/\r?\n|\r/g, '')
      cli.action.stop(emojic.whiteCheckMark)
    } catch {
      cli.action.stop("Please install gcloud cli and login")
    }
    const gc = new Gcloud(token);


    cli.action.start(emojic.house + "  Check gcp project for bobby...")
    var project = { projectId: '' };
    project = await gc.getBobbyProject()
    if (!project) {
      project = await gc.createBobbyProject()
    }
    cli.action.stop(emojic.whiteCheckMark + "  Already exist")
    project.projectId

    cli.action.start(emojic.moneybag + "  Checking billing...")
    var isBillingEnabled = await gc.isBillingEnable(project.projectId)
    if (!isBillingEnabled) {
      cli.action.stop("Should be set")
      this.log("Please visit gcloud in order to activite billing and then retry")
      cli.url("gcloud website", `https://console.cloud.google.com/billing/?project=${project.projectId}`)
      return
    }
    cli.action.stop(emojic.whiteCheckMark + "  Already set")

    cli.action.start("Enable container registry api")
    var enabled = await gc.enableApi(project.projectId, 'containerregistry.googleapis.com')
    if (!enabled) {
      this.log('cannot enable container')
      cli.action.stop("error")
      return
    }
    cli.action.stop(emojic.whiteCheckMark)

    cli.action.start("Enable kubernetes api")
    var enabled = await gc.enableApi(project.projectId, 'container.googleapis.com')
    if (!enabled) {
      this.log('cannot enable kubernetes api')
      cli.action.stop("error")
      return
    }
    cli.action.stop(emojic.whiteCheckMark)


    cli.action.start("Create bucket bobby-config if needed")
    var bucket = await gc.getBucket(project.projectId)
    if (!bucket) {
      bucket = { id: 'bobby-config-' + + Math.floor(Math.random() * Math.floor(10000000000)) }
      await gc.createBucket(project.projectId, bucket.id)
    }
    cli.action.stop(emojic.whiteCheckMark)


    cli.action.start("Create config")
    var config = await gc.getConfig(bucket.id)
    if (!config) {
      await gc.putConfig(bucket.id, { 'bobby-version': '0.0.0' })
    }
    cli.action.stop(emojic.whiteCheckMark)


    cli.action.start("Check if cluster exist")
    var cluster = await gc.getCluster(project.projectId)
    if (!cluster) {
      await gc.createCluster(project.projectId)
    }
    cli.action.stop(emojic.whiteCheckMark)
  }
}
