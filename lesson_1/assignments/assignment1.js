// Part 1: Stack Overflow

let n = 0;

function countUp(n) {
  if (n === 0) return "Done!";
  n++;
  countUp();
}

try {
  countUp();
}catch (e) {
  console.log("Stack overflow!", e.message);
  console.log("Max call stack size: ", n);
}

// Part 2: Trampoline

function trampoline(fn) {
  let result = fn();
  while (typeof result === "function") {
    result = result();
  }
  return result;
}

function flattenArray(arr, result = []) {
  if (arr.length === 0) return result;
  const [first, ...rest] = arr;
  if (Array.isArray(first)) {
    return () => flattenArray([...first, ...rest], result);
  } else {
    result.push(first);
    return () => flattenArray(rest, result);
  }
}

const result = trampoline(() => flattenArray([1, [2, [3, 4], 5], 6]));
console.log("Flattened array:", result);

// Part 3: Deferred Execution

const queue = document.createElement("div");
document.body.appendChild(queue);

function isPrime(n) {
  if (n <= 1) return false;
  if (n <= 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }

  return true;
}

function calculatePrimes(n, current = 2) {
  if (current > n) {
    alert("Primes calculated!");
    return;
  }
  if (isPrime(current)) {
    const primeElement = document.createElement("p");
    primeElement.textContent = current;
    queue.appendChild(primeElement);
  }
  setTimeout(() => calculatePrimes(n, current + 1), 0);
}

calculatePrimes(10000);