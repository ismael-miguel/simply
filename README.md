# simply
simply - A very simple scripting language

---

## What is it?

simply is a very simple scripting language, with a C-like syntax and a more verbose syntax that resembles natural language.

---

## Why make it?

I wanted to practive writting a language using the [recursive descent parser](https://en.wikipedia.org/wiki/Recursive_descent_parser) technique.

And at the same time, why not make something that can be used to teach others how to write code?

The idea behind it is that I believe it is easier to learn how to program if you think about your [algorithms](https://en.wikipedia.org/wiki/Algorithm) in plain English, like [pseudocode](https://en.wikipedia.org/wiki/Pseudocode).<br>
However, the pseudocode is usually converted to a proper code.<br>
To make it easier, the pseudocode can, for the most part, just be the code of your script.

---

## How does it work?

This works by reading certain words and trying to infer the meaning from them.

For example, saying `Set the variable $foo to 123` will extract the `Set` word, and then the `$foo` and `123`.

This way, you can say what you want and it **should** be understood.

To make it less verbose, there's a much more terse (compact) syntax.

For example, `$foo=123` does exactly the same, with a size of 8 characters instead of 28 characters (saving 20 characters of typing).

---

## What is implemented?

Currently, not a lot is implemented, which means that this isn't a useful language yet.

Classes **won't be implemented**, as these can be created by defining functions inside another function, and returning them associated to an array.<br>
Classes bring a lot of complications, including but not limited to inheritance and type checking.


| Done? |           Feature          | About                                                                                                                                |
|:-----:|:--------------------------:|--------------------------------------------------------------------------------------------------------------------------------------|
|   ✔️   |         Data types         | Definitions and compilation of all the basic data types (excluding functions).                                                       |
|   ❌   |         Array keys         | Defining array keys on the array definition itself isn't implemented yet.                                                            |
|   ⚠️   |          Functions         | Currently, some function definitions ignore arguments.                                                                               |
|   ✔️   |    Calling<br> Functions   | Call a function with or without arguments, and optionally store the returned value in a variable or use it as part of an expression. |
|   ✔️   |        Return values       | Return values from the function. Unrelated with the previous feature.                                                                |
|   ⚠️   |   Language<br> Functions   | Not all functions have been added to the language.                                                                                   |
|   ✔️   |     Defining<br> values    | Defining a new variable (local or global) and constants.                                                                             |
|   ✔️   |        Using values        | Use variables and constants as part of a statement.                                                                                  |
|   ⚠️   |    Displaying<br> Values   | Works, but currently needs some work to improve on some aspects.                                                                     |
|   ❌   |   Boolean<br> expressions  | These expressions haven't been implemented yet.                                                                                      |
|   ❌   | Arithmetic<br> expressions | These haven't been implemented at all.                                                                                               |
|   ❌   | Conditional<br> statements | The if block isn't implemented at all.                                                                                               |
|   ❌   |            Loops           | Do ... while, while and for loops haven't been implemented.                                                                          |
|   ❌   |        Syntax sugar        | Some "nice to have" syntax sugar, like a syntax for ranges.                                                                          |
|   ❌   |           Modules          | Modules haven't been implemented yet. Ideas include regular expressions, HTML and a canvas.                                          |

