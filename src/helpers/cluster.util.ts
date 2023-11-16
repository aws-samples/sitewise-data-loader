import cluster from 'cluster';
import * as os from 'os';

const NUM_OF_CPUS = os.cpus().length;

export class ClusterUtil {
    static register(callback: () => void) {
        console.log(`register: ${cluster.isPrimary}`);
        if (cluster.isPrimary) {
            for (let i = 0; i < NUM_OF_CPUS; i++) {
                console.log(`Master server started on ${process.pid}`);
                cluster.fork();
            }
            cluster.on('exit', (worker) => {
                console.log(`Worker ${worker.process.pid} died. Restarting`);
                cluster.fork();
            });
        } else {
            callback();
        }
    }
}
