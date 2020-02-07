const Task = computation => ({
    computation
});

const of = value => Task((_, resolve) => resolve(value));

const reject = value => Task((reject, _) => reject(value));

const map = f => task =>
    Task((reject, resolve) =>
        fork(
            a => reject(a),
            b => resolve(f(b)),
            task
        )
    );

const chain = f => task =>
    Task((reject, resolve) =>
        fork(
            a => reject(a),
            b => fork(reject, resolve, f(b)),
            task
        )
    );

const fork = (reject, resolve, task) => task.computation(reject, resolve);

const sequence = tasks =>
    Task((reject, resolve) => {
        let results = [];
        let count = 0;
        let done = false;

        if (tasks.length === 0) {
            resolve([]);
        } else {
            tasks.forEach((task, index) => {
                fork(
                    err => {
                        if (done === false) {
                            done = true;
                            reject(err);
                        }
                    },
                    result => {
                        results[index] = result;
                        count += 1;
                        if (count === tasks.length) {
                            resolve(results);
                        }
                    },
                    task
                );
            });
        }
    });

module.exports = {
    Task,
    map,
    chain,
    of,
    reject,
    fork,
    sequence
};
