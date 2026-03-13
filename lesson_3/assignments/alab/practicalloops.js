for (i = 0; i <= 100; i++){
    console.log(
        i % 15 === 0 ? "Fizz Buzz" :
        i % 3 === 0 ? "Fizz" :
        i % 5 === 0 ? "Buzz" : i
    );
}

function nextPrime(n) {
    const isPrime = (n) => {
        if(n < 2) return false;
        if(n === 2) return true;
        if(n % 2 === 0) return false;
        for (let i = 3; i <= Math.sqrt(n); i += 2) {
            if (n % i === 0) return false;
        }
        return true;
    };

    let number = n + 1;
    while (!isPrime(number)) number++;
    return number;
}