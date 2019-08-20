
import { get, post, Request } from 'superagent';
import { Exec } from './misc';

const GCP_PROJECT_URL = 'https://cloudresourcemanager.googleapis.com/v1/projects'




export interface GcpProject {
    projectId: string,
    projectNumber: string,
    token: string
}
async function Wait(sec: number): Promise<any> {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, sec * 1000)
    })
}

async function WaitOperation(selflink: string, token: string) {
    return new Promise((resolve, reject) => {
        var interval: any
        selflink = 'https://cloudresourcemanager.googleapis.com/v1/' + selflink
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

export default class Gcloud {
    token = ''
    constructor(token: string) {
        this.token = token;
    }
    get(url: string): Request {
        return get(url).set("Authorization", "Bearer " + this.token)
    }
    post(url: string): Request {
        return post(url).set("Authorization", "Bearer " + this.token)
    }
    async getBobbyProject(): Promise<GcpProject> {
        var result = await this.get(GCP_PROJECT_URL)
        var project: any = result.body.projects.find((project: any) => {
            if (project.lifecycleState != 'ACTIVE') return false
            return project.projectId.indexOf("bobby-home") > -1;
        })
        return project
    }
    async createBobbyProject(): Promise<GcpProject> {
        var projectId = "bobby-home-" + Math.floor(Math.random() * Math.floor(10000000000));
        var operationId = await this.post(GCP_PROJECT_URL)
            .send({
                project_id: projectId,
                name: "bobby-home"
            })
        await WaitOperation(operationId.body.name, this.token)
        return { 'projectId': projectId, 'projectNumber': 'TODOICI' }
    }
    async isBillingEnable(projectId: string): Promise<boolean> {
        var url = `https://cloudbilling.googleapis.com/v1/projects/${projectId}/billingInfo`
        var result = await this.get(url)
        return result.body.billingEnabled
    }
    async getBucket(projectId: string): Promise<any> {
        var result = await this.get('https://www.googleapis.com/storage/v1/b').query('project=' + projectId)
        if (!result.body.items) return null
        var bucket = result.body.items.find((bucket: any) => {
            return bucket.id.indexOf('bobby-config') > -1
        })
        return bucket
    }

    async createBucket(projectId: string, bucketId: string): Promise<any> {
        return await this.post('https://www.googleapis.com/storage/v1/b')
            .query('project=' + projectId)
            .send({ name: bucketId })
    }

    async enableApi(projectId: string, service: string): Promise<boolean> {
        try {
            console.log(`CLOUDSDK_CORE_PROJECT=${projectId} gcloud services enable ${service}`)
            var result = await Exec(`CLOUDSDK_CORE_PROJECT=${projectId} gcloud services enable ${service}`)
        } catch (e) {
            return true

        }
        return true
    }

    async getConfig(bucketId: string): Promise<any> {
        try {
            var result = await this.get(`https://www.googleapis.com/storage/v1/b/${bucketId}/o/config.json`)
                .query('alt=media')
            if (result.status != 200) {
                return null
            }
            return result.body
        } catch (e) {
            return null
        }

    }

    async putConfig(bucketId: string, data: any): Promise<any> {
        await this.post(`https://www.googleapis.com/upload/storage/v1/b/${bucketId}/o`)
            .set('Content-type', 'application/json')
            .query('uploadType=media')
            .query('name=config.json')
            .send(JSON.stringify(data))
    }

    async getCluster(projectId: string): Promise<any> {
        var result = await this.get(`https://container.googleapis.com/v1/projects/${projectId}/zones/us-east1-c/clusters`)
        return result.body.clusters.find((cluster: any) => {
            return cluster.name == "bobby-cluster"
        })
    }

    async createCluster(projectId: string): Promise<any> {
        return await this.post(`https://container.googleapis.com/v1/projects/${projectId}/zones/us-east1-c/clusters`)
            .send({
                "cluster": {
                    "name": "bobby-cluster",
                    "description": "A cluster managed by bobby",
                    "initialNodeCount": 1,
                    "nodeConfig": {
                        "machineType": "n1-standard-2",
                        "oauthScopes": [
                            "https://www.googleapis.com/auth/devstorage.read_only",
                            "https://www.googleapis.com/auth/logging.write",
                            "https://www.googleapis.com/auth/monitoring",
                            "https://www.googleapis.com/auth/service.management.readonly",
                            "https://www.googleapis.com/auth/servicecontrol",
                            "https://www.googleapis.com/auth/trace.append",
                        ]
                    },
                },

                "parent": `/projects/${projectId}/zones/us-east1-c`,
            })
    }
}