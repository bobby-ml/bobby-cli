export function Exec(command: string): Promise<any> {
    return new Promise((resolve, rejects) => {
        var exec = require('child_process').exec;
        exec(command, function (error: any, stdout: any, stderr: any) {
            if (error) {
                rejects(error)
            }
            if (stderr) {
                rejects(stderr)
            }
            resolve(stdout)
        });
    })
}