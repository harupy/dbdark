(() => {
  const enhanceCell = event => {
    // cell in the edit mode
    const cellEditing = document.querySelector('div.is-editing div.CodeMirror')
    
    if (cellEditing) {
      const duplicateLineBelow = cm => {
        const {line, ch} = cm.getCursor();
        const cursorLine = cm.getLine(line);
        ['goLineRight', 'openLine', 'goLineDown'].forEach(cmd => cm.execCommand(cmd));
        cm.replaceSelection(cursorLine);
        cm.setCursor({line: line + 1, ch});
      }

      const duplicateLineAbove = cm => {
        const {line, ch} = cm.getCursor();
        const cursorLine = cm.getLine(line);
        ['goLineLeft', 'openLine'].forEach(cmd => cm.execCommand(cmd));
        cm.replaceSelection(cursorLine);
        cm.setCursor({line, ch});
      }

      const openBlankLineBelow = cm => {
        const {line} = cm.getCursor();
        const cursorLine = cm.getLine(line);
        if (cursorLine.endsWith(':')) {
          ['goLineRight', 'newlineAndIndent'].forEach(cmd => cm.execCommand(cmd));
        } else {
          ['goLineRight', 'openLine', 'goLineDown'].forEach(cmd => cm.execCommand(cmd));
          cm.replaceSelection(cursorLine.match(/^\s*/)[0]);
        }
      }

      const openBlankLineAbove = cm => {
        const {line} = cm.getCursor();
        const cursorLine = cm.getLine(line);
        ['goLineLeft', 'openLine'].forEach(cmd => cm.execCommand(cmd));
        cm.replaceSelection(cursorLine.match(/^\s*/)[0]);
      }

      const delLineLeftSmart = cm => {
        const {line} = cm.getCursor();
        const cursorLine = cm.getLine(line);
        cm.execCommand('delLineLeft');
        cm.replaceSelection(cursorLine.match(/^\s*/)[0]);
      }

      const deleteCursorWord = cm => {
        const cursor = cm.getCursor();
        const anchor = {line: cursor.line, ch: cursor.ch + 1};
        const charCursorRight = cm.getRange(cursor, anchor)
        const regex = /[a-zA-Z0-9_]/  // characters which can be used in a variable name
        if (charCursorRight.match(regex)) {
          cm.execCommand('goWordRight');
        }
        const rightEdge = cm.getCursor();
        cm.execCommand('goWordLeft');
        const leftEdge = cm.getCursor();
        cm.setCursor(cursor);
        cm.replaceRange('', leftEdge, rightEdge);
      }

      // snippets
      const tabDefaultFunc = cellEditing.CodeMirror.options.extraKeys['Tab'];
      const expandSnippetOrIndent = cm => {
        const cursor = cm.getCursor();
        const cursorLine= cm.getLine(cursor.line);
        const cursorLeft = cursorLine.slice(0, cursor.ch);
        const regex = /[^a-zA-Z0-9_]?([a-zA-Z0-9_]+)$/;
        const match = cursorLeft.match(regex)
        const prefix = match ? match[1] : '' ;
        const head = {line: cursor.line, ch: cursor.ch - prefix.length};

        const snippets = {
          'sl'     : 'select()',
          'al'     : 'alias()',
          'gb'     : 'groupBy()',
          'pb'     : 'partitionBy()',
          'fl'     : 'filter()',
          'srt'    : 'spark.read.table()',
          'srp'    : 'spark.read.parquet()',
          'fft'    : 'from pyspark.sql import functions as f, types as t',
          'cnt'    : 'count()',
          'rn'     : 'round()',
          'fna'    : 'fillna()',
          'cntd'   : 'countDistinct()',
          'btw'    : 'between()',
          'wc'     : 'withColumn()',
          'wcr'    : 'withColumnRenamed()',
          'dp'     : 'display()',
          'jn'     : 'join()',
          'ps'     : 'printSchema()',
          'sh'     : 'show()',
          'dt'     : 'distinct()',
          'tpd'    : 'toPandas()',
          'fc'     : 'f.col()',
          'scs'    : 'sqlContext.sql()',
          'agcnt'  : 'agg(f.count())',
          'agcntd' : 'agg(f.countDistinct())',
          'agsum'  : 'agg(f.sum())',
          'agmin'  : 'agg(f.min())',
          'agmax'  : 'agg(f.max())',
        };

        if (prefix in snippets) {
          const body = snippets[prefix];
          cm.replaceRange(body, head, cursor);
          const match = body.match(/\)+$/);
          if (match) {
            cm.moveH(-match[0].length, 'char');
          }
        } else {
          tabDefaultFunc(cm);
        }
      }

      // shortcuts
      const extraKeyActions = {
        'Ctrl-O'      : [openBlankLineBelow],
        'Shift-Ctrl-O': [openBlankLineAbove],
        'Ctrl-L'      : ['delWrappedLineRight'],
        'Ctrl-H'      : [delLineLeftSmart],
        'Ctrl-K'      : [deleteCursorWord],
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
          'jj': [openBlankLineBelow],
          'kk': [openBlankLineAbove],
          'jk': ['goLineRight'],
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