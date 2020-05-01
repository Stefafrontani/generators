// For every function, you can enter the console and run functionToInvestigate.next(argument);
// They were all attached to the window object so they will be in scope

function* generatorOneFunc() {
    yield 1;
    yield 2;
    yield 3;
}
var generatorOne = generatorOneFunc();
window.generatorOne = generatorOne;

/**
 * When yield "expression" with no assignment, the value in the return object will be that expression.
 * In example below, in each { value: value } 'value' will be 1, 2 and 3, in that order
 * generatorOne.next() // Output : {value: 1, done: false}
 * generatorOne.next() // Output : {value: 2, done: false}
 * generatorOne.next() // Output : {value: 3, done: false}
 *
 * As we do not return any value in the function, the last .next() call would return as below:
 * generatorOne.next() // Output : {value: undefined, done: true}
 * To return a value we should redefine generatorOneFunc
 * function* generatorOneFunc() {
 *   yield 1;
 *   yield 2;
 *   yield 3;
 *   return 'anyvalue'
 * }
 *  (*) Output: { value: 'anyvalue', done: true }
 */


function* generatorTwoFunc() {
    var a = yield;
    return a * 2;
}

var generatorTwo = generatorTwoFunc();
window.generatorTwo = generatorTwo;

/**
 * When yield is assign to a variable, it will expect to receive a value inside .next call like .next(value) to assign that value to "a"
 * generatorTwo.next()  // Output: {value: undefined, done: false}
 * generatorTwo.next(2) // Output: {value: 4, done: true}
 */

function* generatorThreeFunc() {
    while(true) {
        let a = yield;
        yield a * 10;
    }
}
var generatorThree = generatorThreeFunc();
window.generatorThree = generatorThree;

/**
 * The first yield will return an undefined value cause yield does not have an expression to the right
 * It will wait till a value is passed to the next next() call to assign it to 'a': generatorThree.next(nextValueA);
 * In the next line 'yield a * 10' we put yield instead of return because we want to return the value, but we do not want to stop the execution of the while
 * generatorThree.next()  // Output : {value: undefined, done: false}
 * generatorThree.next(2) // Output : {value: 20, done: false}
 * generatorThree.next()  // Output : {value: undefined, done: false}
 * generatorThree.next(3) // Output : {value: 30, done: false}
 */

function* generatorWithError() {
    let todosResponse = yield fetch('https://json_ERROR_IN_URL_placeholder.typicode.com/todos');
    let todos = yield todosResponse.json();

    let firstId = todos[0].id;
    let todoResponse  = yield fetch(`https://jsonplaceholder.typicode.com/todos/${firstId}`)
    let todo = yield todoResponse.json();

    return todo;
}

function* generatorWithNoError() {
    let todosResponse = yield fetch('https://jsonplaceholder.typicode.com/todos');
    let todos = yield todosResponse.json();

    let firstId = todos[0].id;
    let todoResponse  = yield fetch(`https://jsonplaceholder.typicode.com/todos/${firstId}`)
    let todo = yield todoResponse.json();

    return todo;
}

function asyncFuncWithNoErrorHandler(makeGenerator) {
    return function() {
        const generator = makeGenerator();

        function recursive(result) {

            if (result.done) {
                console.log(result.value)
                return result.value
            };

            if (!result.done) {
                return new Promise(function(resolve, reject) {
                    resolve(result.value)
                })
                .then((valor) => {
                    return recursive(generator.next(valor))
                })
            }
        }

        return recursive(generator.next());
    }
}

function asyncFuncWithErrorHandler(makeGenerator) {
    return function() {
        const generator = makeGenerator();

        function recursive(result) {

            if (result.done) {
                console.log(result.value)
                return result.value
            };

            if (!result.done) {
                return new Promise(function(resolve, reject) {
                    resolve(result.value)
                })
                .then((valor) => {
                    return recursive(generator.next(valor))
                })
                .catch((error) => {
                    // catch error in every promise made
                    console.log(error);
                })
            }
        }

        try {
            return recursive(generator.next());
        } catch(error) {
            console.log(error); // handle error
        }
    }
}

const asyncWithNoErrorHandlerFailed = asyncFuncWithNoErrorHandler(generatorWithError);
window.asyncWithNoErrorHandlerFailed = asyncWithNoErrorHandlerFailed;
// asyncWithNoErrorHandler This will throw an error that wont be catch (web console error red)
// Console output:
// Uncaught (in promise) TypeError: Failed to fetch

const asyncWithNoErrorHandlerNoFailed = asyncFuncWithErrorHandler(generatorWithError);
window.asyncWithNoErrorHandlerNoFailed = asyncWithNoErrorHandlerNoFailed;
// asyncWithNoErrorHandlerNoFailed will not failed because errors are being catch inside .catch()
// Console output:
// TypeError: Failed to fetch (NO RED, no error unhandled)

const asyncWithErrorHandlerWorking = asyncFuncWithErrorHandler(generatorWithNoError);
window.asyncWithErrorHandlerWorking = asyncWithErrorHandlerWorking;
// This will return the todo