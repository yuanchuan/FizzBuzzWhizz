/**
 *  FizzBuzzWhizz in css (write with love & care).
 *
 *  yuanchuan23@gmail.com  
 *  2014.5.1
 */

(function() {

  var selector = { 'A': ':nth-child(An)', 'B': ':nth-child(Bn)',  'C': ':nth-child(Cn)' }; 
  var content  = { 'A': 'Fizz',           'B': 'Buzz',            'C': 'Whizz' }; 
  var selected = { 'A': '2',              'B': '3',               'C': '5' };

  var pattern  = [ 'A', 'B', 'C', 'AB', 'BC', 'AC', 'ABC' ]; 
  var match    = /(A)?(B)?(C)?/g;
  var heading  = 'A';

  var join = function() {
    var args = [].slice.call(arguments);
    return (args[0].join ? args[0] : args).join('\n');
  };

  var template = {
    initial: join(
        'p:after {'
      , '  content: attr(data-num);'
      , '}'
      , ''
    ),
    special: join(
        'p[data-num*="<head>"]:after {'
      , '  content: "<content>" !important;'
      , '}'
      , ''
    ), 
    rule: join(
        'p<selector>:after {'
      , '  content: "<content>";'
      , '}'
      , ''
    )
  };

  var generator = function(stop) {
    match.toString().replace(/\?/g, function() { stop++ });
    return function(pat, fn) {
      return pat.replace(match, function() {
        return [].slice.call(arguments, 1, stop).map(fn).join('');
      });  
    };
  }(1);

  var selectorGenerator = function(pat, number) {
    return generator(pat, function(n) {
      return n && selector[n].replace(n, number[n]);
    });
  };

  var contentGenerator = function(pat) {
    return generator(pat, function(n) {
      return content[n];
    });
  };

  var buildStyle = function(number) {
    return join(
        (template.initial)
      , (template.special
          .replace('<head>', number[heading])
          .replace('<content>', content[heading]) 
        )
      , join(pattern.map(function(pat) {
          return (template.rule
            .replace('<selector>', selectorGenerator(pat, number))
            .replace('<content>',  contentGenerator(pat))
          );
        }))
    );
  };

  var setStyle = function(el) {
    return function(content) {
      if (!el) {
        el = document.createElement('style');
        document.getElementsByTagName('head')[0].appendChild(el);         
      }
      return el.styleSheet
        ? (el.styleSheeet.cssText = content)
        : (el.innerHTML = content);
    };
  }();

  var highlight = function() {
    var regTag = /^(\s*)((?:[\.#]?[a-zA-Z\-_]+)+)(.+{)/;  
    var regParen = /(\{|\})/;
    var regRule = /^(\s*)([a-zA-Z\-_]+)(:\s*)(.+)/;
    var regNumber = /(\d+)/g;
    var wrap = function(name, value) {
      return '<span class="highlight-' + name + '">' + value + '</span>';
    }; 
    var normalize = function(fn) {
      return function() {
        return fn.apply(null, [].map.call(arguments, function(arg) {
          return arg && arg || '';
        }));
      };
    };
    return function(code) {
      return join(code.split(/\n/).map(function(line) {
        return line
          .replace(regTag, normalize(function(_, $1, $2, $3) {
            return $1 + wrap('tag', $2) + $3.replace(regNumber, function(_, $1) {
              return wrap('number', $1);
            })  
          }))
          .replace(regParen, normalize(function(_, $1) {
            return wrap('parens', $1);
          }))
          .replace(regRule, normalize(function(_, $1, $2, $3, $4) {
            if (regParen.test(_)) { return _; }
            return $1 + wrap('attribute', $2) + $3 + wrap('value', $4);
          }))
      }));
    };
  }();


  /**
   *  Bind events and set default styles.
   */

  var updateStyle = function(pre) {
    return function() {
      if (!pre) {
        pre = document.querySelector('pre.css')
      };
      if (pre) {
        pre.innerHTML = highlight(setStyle(buildStyle(selected)))
      };
    }
  }();
  
  var updateNumber = function(e) {
    var span = e && e.target || window.event.srsElement;
    if (span && span.tagName.toLowerCase() === 'span') {
      if (/on/.test(span.className)) return false;
      var parent = span.parentNode;

      // switch class
      var on = parent.querySelector('.on')
      if (on) { 
        on.className = '' 
      }
      span.className = 'on';

      // update selected numbers.
      var pat = parent.getAttribute('data-pat'); 
      var num = span.getAttribute('data-num');
      selected[pat] = num;

      // update styles.
      updateStyle();
    }
  }

  window.addEventListener('load', function() {
    var switcher = document.querySelector('#switcher');
    if (switcher) {
      switcher.addEventListener('click', updateNumber, true);
    } 
    for (var pat in selected) {
      var num = selected[pat];
      var query = 'li[data-pat="' +pat+ '"] span[data-num="' +num+ '"]';
      var span = document.querySelector(query);
      if (span) {
        span.className = 'on';
      }
    } 
    updateStyle();
  });

}());
