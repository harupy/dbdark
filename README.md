# Databricks Notebook Enhancer

Just a little hack to enhance the editor functionality of Databricks notebook.

<kbd>
  <img src="https://user-images.githubusercontent.com/17039389/53938304-21371780-40f3-11e9-949e-00c38dddf488.gif" style="thin solid black;">
</kbd>

## Installation
1. Clone this repository
1. Open `chrome://extensions` on Chrome
1. Enable "Developer mode"
1. Click "Load unpacked"
1. Select the folder that was just cloned

## Getting Started
1. Open a Databricks notebook
1. Make sure the extension logo is colored (which means the extension is enabled)
1. Select a cell and enter the edit mode
1. Type `df.gb`
1. Press `Tab` (`gb` will be expanded to `groupBy()`)
1. Press `Ctrl-u` (The current line will be duplicated below)
1. Press `jj` (A blank line will be inserted below)


## How this works
Each cell on the notebook has an object called `CodeMirror` which provides functions to get and edit the cell content. This extension injects a JS script to override some properties of `CodeMirror` and add features not provided by default.


[CodeMirror: User Manual](https://codemirror.net/doc/manual.html)

## Shortcuts
**Note that some default shortcuts in Chrome are overriden.**

|Shortcut|Action|
|:-|:-|
|`Ctrl-k`|Delete the word the cursor is on|
|`Ctrl-o`|Open a blank line below|
|`Ctrl-Shift-o`|Open a blank line above|
|`Ctrl-l`|Delete up to the end of the current line|
|`Ctrl-h`|Delete up to the start of the current line|
|`Ctrl-u`|Duplicate the current line below|
|`Ctrl-Shift-u`|Duplicate the current line above|

## Key Sequences
This feature allows you to trigger actions by pressing one or more keys multiple times **fast** in sequence. This feature is similar to mapping `jj` to `Esc` in Vim.

|Keys|Action|
|:-|:-|
|`jj`|Open a blank like below|
|`jk`|Go to the end of the current line|
|`kk`|Delete the word the cursor is on|


## Snippets (Press `Tab` to expand)
|Prefix|Snippet|
|:-|:-|
|`sl`|`select()`|
|`al`|`alias()`|
|`dt`|`distinct()`|
|`gb`|`groupBy()`|
|`pb`|`partitionBy()`|
|`ps`|`printSchema()`|
|`fl`|`filter()`|
|`srt`|`spark.read.table()`|
|`srp`|`spark.read.parquet()`|
|`fft`|`from pyspark.sql import functions as f, types as t`|
|`cnt`|`count()`|
|`rn`|`round()`|
|`fna`|`fillna()`|
|`dcnt`|`distinctCount()`|
|`btw`|`between()`|
|`wc`|`withColumn()`|
|`wcr`|`withColumnRenamed()`|
|`dp`|`display()`|
|`jn`|`join()`|
|`tpd`|`toPandas()`|
|`fc`|`f.col()`|
|`scs`|`sqlContext.sql()`|
|`aggcnt`|`agg(f.count())`|
|`aggsum`|`agg(f.sum())`|
|`aggmin`|`agg(f.min())`|
|`aggmax`|`agg(f.max())`|

## Customize Snippets
You can create your own snippets by adding a key/value pair to `snippets` in `main.js`.
```js
const snippets = {
          'sl'    : 'select()',
          'al'    : 'alias()',
          'gb'    : 'groupBy()',
          ...
          // add your own snippets
          'ms'   : 'mysnippet()',
      {
```

## References
- [Is there a way to use Vim keybindings in Google Colaboratory?](https://stackoverflow.com/questions/48674326/is-there-a-way-to-use-vim-keybindings-in-google-colaboratory)
