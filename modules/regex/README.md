# Regular expression module

This module is used to create regular expressions, manipulate and/or match strings.

## The basics...

Before starting, you should read about the basics.

### What is a regular expression?

A regular expression is a way to describe a pattern that will be matched against a string.

With those matches, it is possible to manipulate or extract portions of the string.

### How to use regular expressions?

Regular expressions are kinda standard, and there's lots of tutorials[^RegExpGuide] on how to use them.

In this implementation, it uses the JavaScript's `RegExp`[^RegExp] engine.

### How to test them?

There are multiple places where you can test them:
 - regular expressions 101 (aka: Regex101) - https://regex101.com/
 - RegExr - https://regexr.com/
 - iHateRegex - https://ihateregex.io/playground
 - RegEx Pal - https://www.regexpal.com/
 - Scriptular - https://scriptular.com/

Alternativelly, the browser console can be used to test the results as well.

<hr>

<hr>

## Methods and values

Lists all the values available in the `!REGEX` module.

### `version` property

Contains the current module version, as a string.

Current version is `"1.0"`.

### `create($regex, $flags)` method

Returns a regex object or an error object.

In case there's a syntax error, an error object will be returned, with the `error` property set to `true`.

#### Example of success

This returns a `Regex` object (not to be confused with a JavaScript `RegExp`[^RegExp] object).

```
Set $regex to the result of calling !REGEX->create("^abc", 'i').
// Alternativelly: $regex = !REGEX->create("^abc", 'i');
```

#### Example of failure

This returns an error object (not to be confused with a JavaScript `Error`[^Error] object).

```
Set $regex to the result of calling !REGEX->create(".\\^abc", 'i').
// Alternativelly: $error = !REGEX->create(".\\^abc", 'i');
```

#### Checking for failure

On errors, the `error` property is set to `true`, so, errors can be handled like this:

```
Set $regex to the result of calling !REGEX->create("^abc", 'i').

In case of $regex->error then {
	Show "Invalid regular expression: ", $regex->message;
	Return false.
}

// Continue with the code...
```

It is important to return out of the function or out of the main scope, to avoid trying to use an `Error` object as a `Regex` object.

<hr>

<hr>

## `Error` object

This object results from any errors when calling `!REGEX->create( ... )`.

It contains the following:

### `error` property

This property will *always* be `true`, in case of **failure**.

### `name` property

The name of the error that occurred.<br>
Usually should be `"SyntaxError"`[^RegExpSyntaxError].

### `message` property

Contains a simple message describing the error that occurred.

<hr>

<hr>

## `Regex` object

This object results from successfully calling `!REGEX->create( ... )`.

It contains the following:

### `error` property

This property will *always* be `false`, in case of **success**.

### `replace($string, $value, $count)` method

Searches the `$string` and replaces all matches with the new `$value`.

If `$count` is specified and is lower than 1, returns an empty string.<br>
The value of `$count` will be limited to 9007199254740991[^MAX_SAFE_INTEGER].

#### Example:
```
Set $regex to the result of calling !REGEX->create("^abcd", 'i').
Set $string to "AbCdEfGh".

Show the result of calling $regex->replace($string, '').
```
<sub>Expected output: `EfGh`</sub>

### `replace_fn($string, $function, $count)` method

Searches the `$string` and runs the `$function` on each match, up to `$count` times.<br>
The `$function` must return the value to replace, otherwise, the matched value will be replaced with an empty string.

If `$function` isn't a function, returns `null`.

If `$count` is specified and is lower than 1, returns an empty string.<br>
The value of `$count` will be limited to 9007199254740991[^MAX_SAFE_INTEGER].

The `$function` will receive the following arguments:<br>
<sub>The function isn't required to take all these arguments.</sub>
 - `$match` - The whole value that was matched;
 - `$groups` - Array with all the capture groups' values, both numeric and named;
 - `$index` - The 0-based index where the `$match` was found;
 - `$string` - The original string value.

#### Example:
```
Set $regex to the result of calling !REGEX->create("(foo)", 'i').
Set $string to "I went to foo's bar".

Set $function to an anonymous function($match) {
	Return the result of calling &ucfirst($match).
}

Show the result of calling $regex->replace_fn($string, $function).
```
<sub>Expected output: `I went to Foo's bar`</sub>



[^RegExp]: RegExp page, on MDN Web Docs:<br>
	https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp

[^RegExpGuide]: RegExp Guide page, on MDN Web Docs:<br>
	https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions

[^Error]: Error page, on MDN Web Docs:<br>
	https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error

[^RegExpSyntaxError]: RegExp page, Exceptions section on MDN Web Docs:<br>
	https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/RegExp#exceptions

[^MAX_SAFE_INTEGER]: Number.MAX_SAFE_INTEGER page on MDN Web Docs:<br>
	https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER
