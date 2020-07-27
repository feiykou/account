// async function f1() {
//     console.log(111);
// }

// f1();
fn1()

function fn1() {
    console.log(12);
    fn2()
}

// 不管是异步还是同步，都去try...catch比较麻烦
function fn2() {
    try{
        // 一般try...catch会对throw的异常进行捕获，但是await可以监听promise的异常，然后await又进行throw
        fn3()
    } catch(e) {
        console.log('error2');
    }
}

function fn3() {
    return new Promise((resolve,reject) => {
        setTimeout(() => {
            const r = Math.random()
            if(r < 0.5) {
                reject('error3')
            } else {
                resolve('success')
            }
        }, 1000)
    })
}