


export class IService{
    constructor(){

    }
}




export class DB{
    token = ''
    path = ''
    constructor(token: string, path: string){
        this.token = token;
        this.path = path;
    }

    getServices():Promise<IService>{
        return
    }

    CreateService(name: string, url: string){

    }

}