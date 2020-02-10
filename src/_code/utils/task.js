export const Task = computation => ({
    computation
});

export const of = value => Task((_, resolve) => resolve(value));

export const reject = value => Task((reject, _) => reject(value));

export const map = f => task =>
    Task((reject, resolve) =>
        fork(
            a => reject(a),
            b => resolve(f(b)),
            task
        )
    );

export const chain = f => task =>
    Task((reject, resolve) =>
        fork(
            a => reject(a),
            b => fork(reject, resolve, f(b)),
            task
        )
    );

export const fork = (reject, resolve, task) => task.computation(reject, resolve);

export const sequence = tasks =>
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
