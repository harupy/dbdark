(() => {
  const enhanceCell = event => {
  // cell in editing mode
    const cellEditing = document.querySelector('div.is-editing div.CodeMirror')
    
    if (cellEditing) {
      const duplicateLineBelow = cm => {
        const {line, ch} = cm.getCursor();
        const currentLineContent = cm.getLine(line);
        ['goLineRight', 'openLine', 'goLineDown'].forEach(cmd => cm.execCommand(cmd));
        cm.replaceSelection(currentLineContent);
        cm.setCursor({line: line + 1, ch});
      }

      const duplicateLineAbove = cm => {
        const {line, ch} = cm.getCursor();
        const currentLineContent = cm.getLine(line);
        ['goLineLeft', 'newlineAndIndent', 'goLineUp'].forEach(cmd => cm.execCommand(cmd));
        cm.replaceSelection(currentLineContent);
        cm.setCursor({line, ch});
      }

      const spChars = [' ', ',', '.', '(', '[', '{', '+', '-', '*', '/', '=', '~', '%', '&', '@'];

      const deleteCursorWord = cm => {
        const anchor = cm.getCursor();
        const head = {line: anchor.line, ch: anchor.ch - 1};
        const charCursorLeft = cm.getRange(head, anchor)
        if ((anchor.ch !== 0) && (spChars.indexOf(charCursorLeft) === -1)) {
          cm.execCommand('goWordLeft');
        }
        cm.execCommand('delWordAfter');
      }

      // snippets
      const tabDefaultFunc = cellEditing.CodeMirror.options.extraKeys['Tab'];
      const expandSnippetOrIndent = cm => {
        const cursor = cm.getCursor();
        const cursorLine= cm.getLine(cursor.line);
        const cursorLeft = cursorLine.slice(0, cursor.ch);
        const lastIdxs = spChars.map(c => cursorLeft.lastIndexOf(c));
        const prefixStartIdx = Math.max(...lastIdxs) + 1;
        const head = {line: cursor.line, ch: prefixStartIdx};
        const prefix = cm.getRange(head, cursor);

        const snippets = {
          'sl'    : 'select()',
          'al'    : 'alias()',
          'gb'    : 'groupBy()',
          'pb'    : 'partitionBy()',
          'fl'    : 'filter()',
          'srt'   : 'spark.read.table()',
          'srp'   : 'spark.read.parquet()',
          'fft'   : 'from pyspark.sql import functions as f, types as t',
          'cnt'   : 'count()',
          'rn'    : 'round()',
          'fna'   : 'fillna()',
          'dcnt'  : 'distinctCount()',
          'btw'   : 'between()',
          'wc'    : 'withColumn()',
          'wcr'   : 'withColumnRenamed()',
          'dp'    : 'display()',
          'jn'    : 'join()',
          'ps'    : 'printSchema()',
          'sh'    : 'show()',
          'dt'    : 'distinct()',
          'tpd'   : 'toPandas()',
        };

        if (prefix in snippets) {
          const body = snippets[prefix];
          cm.replaceRange(body, head, cursor);
          if (body.endsWith(')')) {
            cm.moveH(-1, 'char');
          }
        } else {
          tabDefaultFunc(cm);
        }
      }

      // shortcuts
      const extraKeyActions = {
        'Ctrl-O'      : ['goLineRight', 'newlineAndIndent'],  // insert a new line below
        'Shift-Ctrl-O': ['goLineLeft', 'newlineAndIndent', 'goLineUp', 'indentAuto'], // insert a new line above
        'Ctrl-L'      : ['delWrappedLineRight'],  // kill line to end
        'Ctrl-H'      : ['delWrappedLineLeft', 'indentAuto'],  // kill line to beginning
        'Ctrl-K'      : [deleteCursorWord],  // delete inner word
        'Ctrl-U'      : [duplicateLineBelow],
        'Shift-Ctrl-U': [duplicateLineAbove],
        'Tab'         : [expandSnippetOrIndent],
      }

      const execAction = (cm, act) => {
        switch (typeof(act)) {
          case 'string':
            cm.execCommand(act);
            break;
          case 'function':
            act(cm);
            break;
          default:
            throw new TypeError(`Expected string or function, but got ${typeof(act)}`);
        }
      }

      for (const [key, actions] of Object.entries(extraKeyActions)) {
        cellEditing.CodeMirror.options.extraKeys[key] = cm => {
          actions.forEach(act => execAction(cm, act));
        };
      }

      // key sequences
      const onKeyup = (cm, e) => {
        const anchor = cm.getCursor();
        const head = {line: anchor.line, ch:anchor.ch - 2};
        const now = (new Date()).getTime();
        const lapseTime = now - (cm.changedAt || now);  // unit: milliseconds 
        cm.changedAt = now;
        
        const fastKeysActions = {
          'jj': ['goLineRight', 'newlineAndIndent'],
          'jk': ['goLineRight'],
          'kk': [deleteCursorWord],
        }

        if (lapseTime < 500) {
          const keys = cm.getRange(head, anchor);
          if (keys in fastKeysActions) {
            cm.replaceRange('', head, anchor);
            fastKeysActions[keys].forEach(act => execAction(cm, act));
          }
        }
      }

      if (cellEditing.CodeMirror._handlers.keyup.length === 1) {
        cellEditing.CodeMirror.on('keyup', onKeyup)
      }
    }
  };

  document.addEventListener('mouseup', enhanceCell, false);
  document.addEventListener('keyup', enhanceCell, false);
})();