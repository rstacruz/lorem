(function() {
  var ChorvaGenerator, EnglishGenerator, Generator, Generators, JabberwockGenerator, LatinGenerator, Sham, TagalogGenerator, c, cache, capitalize, join, methods, periodize, pick, pluralize, punctuation, r, rand, sentencize, _;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __slice = Array.prototype.slice, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  _ = this._ || require('underscore');
  Sham = (function() {
    function Sham() {}
    Sham.prototype.cache = [];
    Sham.prototype.max = 5;
    Sham.prototype.pick = function(arr) {
      var str, tries;
      tries = 0;
      str = pick(arr);
      while (this.cache.indexOf(str) !== -1 && tries < (this.max * 2)) {
        tries += 1;
        str = pick(arr);
      }
      this.cache.unshift(str);
      if (this.cache.length > this.max) {
        this.cache = this.cache.slice(0, this.max);
      }
      return str;
    };
    return Sham;
  })();
  rand = function(min, max) {
    return Math.round(Math.random() * (max - min)) + min;
  };
  pick = function(arr) {
    return arr[rand(0, arr.length - 1)];
  };
  c = function(chances, max) {
    if (max == null) {
      max = 100;
    }
    return Math.random() < (chances * 1.0 / max);
  };
  cache = new Sham;
  r = function(arr) {
    return cache.pick(arr);
  };
  join = function(array) {
    return _.inject(_.flatten(array), function(str, word) {
      if (word.match(punctuation)) {
        return "" + str + word;
      } else {
        return "" + str + " " + word;
      }
    });
  };
  punctuation = /^[,\?!\."]+$/;
  sentencize = function(array) {
    var str;
    if (array.constructor !== Array) {
      array = [array];
    }
    str = periodize(capitalize(join(array)));
    if (str.length > 0) {
      if (!str[str.length - 1].match(punctuation)) {
        str += ".";
      }
    }
    return str;
  };
  periodize = function(str) {
    if (str.length > 0 && !str[str.length - 1].match(punctuation)) {
      return str + ".";
    } else {
      return str;
    }
  };
  capitalize = function(str) {
    if (str.length > 0) {
      return str[0].toUpperCase() + str.substr(1);
    } else {
      return str;
    }
  };
  pluralize = function(str) {
    if (str.length === 0) {
      return str;
    }
    if (str.substr(str.length - 1) === 'y') {
      return "" + (str.substr(0, str.length - 1)) + "ies";
    } else if (str.substr(str.length - 1) === 's') {
      return "" + str + "es";
    } else if (['sh', 'ch', 'th'].indexOf(str.substr(str.length - 2)) > -1) {
      return "" + (str.substr(0, str.length - 2)) + "es";
    } else {
      return "" + str + "s";
    }
  };
  Generator = (function() {
    function Generator() {}
    Generator.prototype.SENTENCE = function() {
      return '';
    };
    Generator.prototype.sentence = function() {
      return sentencize(this.SENTENCE());
    };
    Generator.prototype.paragraph = function(length) {
      var str, tries;
      if (length == null) {
        length = 200;
      }
      str = '';
      tries = 0;
      while (str.length < length && tries < length) {
        if (str.length > 0 && str[str.length - 1] !== ' ') {
          str += ' ';
        }
        str += this.sentence();
      }
      return str;
    };
    Generator.prototype.paragraphs = function(count, length) {
      var output;
      if (length == null) {
        length = null;
      }
      output = [];
      _.times(count, __bind(function() {
        return output.push(this.paragraph(length));
      }, this));
      return output;
    };
    Generator.prototype.use = function(what, self) {
      if (self == null) {
        self = this;
      }
      if (typeof what === 'function') {
        return this.use(what.apply(self), self);
      } else if (self[what]) {
        return this.use(self[what](), self);
      } else {
        return what;
      }
    };
    return Generator;
  })();
  Generator.phrase = function(args) {
    var list;
    list = typeof args === 'function' ? args() : args;
    list = _.flatten(list);
    return function() {
      return _.compact(_.flatten(_.map(list, __bind(function(element) {
        return this.use(element);
      }, this))));
    };
  };
  Generator.words = function(array) {
    return function() {
      return r(array);
    };
  };
  Generator.randomize = function(f) {
    var chances, max;
    chances = f.apply(this);
    max = _.inject(chances, (function(a, _arg) {
      var chance, element;
      chance = _arg[0], element = _arg[1];
      return a + chance;
    }), 0);
    return function() {
      var chance, element, i, n, stack, _ref;
      i = rand(1, max);
      stack = 0;
      for (n in chances) {
        _ref = chances[n], chance = _ref[0], element = _ref[1];
        stack += chance;
        if (i <= stack) {
          return this.use(element, this);
        }
      }
    };
  };
  methods = ['paragraphs', 'paragraph', 'sentence'];
  _.each(methods, function(meth) {
    return Generator[meth] = function() {
      var args, generator;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      generator = new this;
      return generator[meth].apply(generator, args);
    };
  });
  EnglishGenerator = (function() {
    __extends(EnglishGenerator, Generator);
    function EnglishGenerator() {
      EnglishGenerator.__super__.constructor.apply(this, arguments);
    }
    EnglishGenerator.prototype.SENTENCE = EnglishGenerator.randomize(function() {
      return [[1, "QUESTION"], [1, "SENTENCE1"], [1, "SENTENCE2"], [1, "SENTENCE3"], [1, "SENTENCE4"]];
    });
    EnglishGenerator.prototype.SENTENCE1 = EnglishGenerator.phrase(function() {
      return ['PREPOSPHRASEPRE', 'NP', c(50) ? ['of', c(30) ? 'ARTICLE' : void 0, 'NOUN'] : void 0, 'TRANSITIVE_S', c(50) ? ['THE', 'NOUN'] : ['NOUN', 'PREPOS', 'NOUN']];
    });
    EnglishGenerator.prototype.SENTENCE2 = EnglishGenerator.phrase(function() {
      return ['PREPOSPHRASEPRE', 'AN_ADJNOUN', 'VERBAS', 'THE', 'ADJNOUN', c(50) ? ['of', c(50) ? 'ADJECTIVE' : void 0, 'NOUNPLURAL'] : void 0, 'PREPOSPHRASE', c(50) ? ['PREPOS', 'THE', 'PLACE'] : void 0];
    });
    EnglishGenerator.prototype.SENTENCE3 = EnglishGenerator.phrase(function() {
      return ['ARTICLE', 'NOUN', 'VERBPAST', 'ARTICLE', c(50) ? 'ADJECTIVE' : void 0, 'NOUN', c(25) ? 'ADVERB' : void 0, 'POST'];
    });
    EnglishGenerator.prototype.SENTENCE4 = EnglishGenerator.phrase(function() {
      return ['QUOTE', "ENTITY", c(20) ? "ADVERB" : void 0, "VERBPAST", c(10) ? ['PREPOS', 'THE', 'PLACE'] : void 0];
    });
    EnglishGenerator.prototype.QUOTE = function() {
      var punc;
      punc = r(['!', ',', ',']);
      return "\"" + (capitalize(join(this.SAYING()))) + punc + "\"";
    };
    EnglishGenerator.prototype.SAYING = EnglishGenerator.randomize(function() {
      return [
        [
          1, this.phrase(function() {
            return ["TRANSITIVE", "ARTICLE", "NP"];
          })
        ]
      ];
    });
    EnglishGenerator.prototype.QUESTION = EnglishGenerator.randomize(function() {
      return [
        [
          1, this.phrase(function() {
            return ["PREPOSPHRASEPRE", "WHAT", "?"];
          })
        ], [
          2, this.phrase(function() {
            return [c(50) ? "but" : void 0, "WHOWHAT", "VERBPAST", c(60) ? ["ARTICLE", "NP"] : void 0, "?"];
          })
        ]
      ];
    });
    EnglishGenerator.prototype.NP = EnglishGenerator.randomize(function() {
      return [
        [
          1, this.phrase(function() {
            return [c(25) ? 'ADJECTIVE' : void 0, 'NOUN'];
          })
        ]
      ];
    });
    EnglishGenerator.prototype.ENTITY = EnglishGenerator.randomize(function() {
      return [
        [1, "PRONOUN"], [
          1, this.phrase(function() {
            return ['ARTICLE', c(25) ? 'POSESSIVE' : void 0, c(25) ? 'ADJECTIVE' : void 0, 'NOUN'];
          })
        ]
      ];
    });
    EnglishGenerator.prototype.PREPOSPHRASEPRE = EnglishGenerator.randomize(function() {
      return [
        [3, ''], [
          1, this.phrase(function() {
            return ["PRESET_PREPOS_PHRASE", ","];
          })
        ], [
          2, this.phrase(function() {
            return ["ADVERB", ","];
          })
        ], [
          1, this.phrase(function() {
            return ["ADVERB", "VERBPAST", ","];
          })
        ]
      ];
    });
    EnglishGenerator.prototype.POST = EnglishGenerator.randomize(function() {
      return [
        [3, ''], [
          2, this.phrase(function() {
            return [",", "INDEED", "ADJECTIVE"];
          })
        ], [
          1, this.phrase(function() {
            return [c(50) ? "," : void 0, "INDEED"];
          })
        ], [
          1, this.phrase(function() {
            return [c(50) ? "," : void 0, "ADVERB"];
          })
        ]
      ];
    });
    EnglishGenerator.prototype.AN_ADJNOUN = function() {
      var str;
      str = join(this.ADJNOUN());
      if (['a', 'e', 'i', 'o', 'u'].indexOf(str[0]) > -1) {
        return "an " + str;
      } else {
        return "a " + str;
      }
    };
    EnglishGenerator.prototype.POSESSIVE = function() {
      return "" + (this.NOUN()) + "'s";
    };
    EnglishGenerator.prototype.ARTICLE = EnglishGenerator.randomize(function() {
      return [
        [
          1, this.phrase(function() {
            return ["THE"];
          })
        ], [
          1, this.phrase(function() {
            return ["THE", "POSESSIVE"];
          })
        ]
      ];
    });
    EnglishGenerator.prototype.ADJNOUN = EnglishGenerator.phrase(function() {
      return [c(33) ? "ADJECTIVE" : void 0, "NOUN"];
    });
    EnglishGenerator.prototype.PREPOSPHRASE = EnglishGenerator.phrase(function() {
      return ["PREPOS", "NOUNPLURAL"];
    });
    EnglishGenerator.prototype.SUBJECTPLURAL = EnglishGenerator.randomize(function() {
      return [
        [
          1, this.phrase(function() {
            return ['PRONOUNPLURAL'];
          })
        ], [
          1, this.phrase(function() {
            return ['the', 'ENTITYPLURAL'];
          })
        ]
      ];
    });
    EnglishGenerator.prototype.TRANSITIVE_S = function() {
      return pluralize(this.TRANSITIVE());
    };
    EnglishGenerator.prototype.NOUN = EnglishGenerator.words(['depth', 'sense', 'touch', 'farce', 'sight', 'vision', 'height', 'balance', 'pitch', 'scion', 'might', 'store', 'funk', 'worm', 'coffee', 'bean', 'ice', 'salad', 'finger', 'chicken', 'dog', 'cat', 'mouse', 'trunk', 'pond', 'chain', 'liquid', 'shift', 'fiber', 'dilemma', 'clock', 'past', 'rain', 'cap', 'key', 'string', 'bill', 'rod', 'outline', 'hour', 'period', 'time', 'number', 'section', 'state', 'page', 'content', 'surface', 'work', 'comment', 'acuse', 'support', 'postcard', 'sheet', 'paper', 'phone', 'mail', 'gravy', 'sauce', 'gas', 'insect', 'claw', 'powder', 'plastic', 'seed', 'leaf', 'bridge', 'home', 'flake', 'art', 'pail', 'crown', 'elephant', 'sky', 'vodka', 'gin', 'tonic', 'grin', 'smile', 'valley', 'threat', 'boss', 'employee', 'heart', 'head', 'fingernail', 'aquarium', 'forest', 'science', 'accessory']);
    EnglishGenerator.prototype.PLACE = EnglishGenerator.words(['kitchen', 'hall', 'school', 'zoo', 'local library', 'camp']);
    EnglishGenerator.prototype.ADJECTIVE = EnglishGenerator.words(['conventional', 'sequential', 'not quite', 'chocolate', 'hazardous', 'deviant', 'leather', 'ambient', 'biblical', 'general', 'crescent', 'new', 'low', 'new', 'blue', 'thin', 'warm', 'high', 'late', 'rich', 'ripe', 'sharp', 'tight', 'focal', 'scant', 'silly', 'vetted', 'rotten', 'shiny', 'dull', 'lucky', 'solid', 'fine', 'cold', 'hot', 'dizzy', 'dark', 'sick', 'nice', 'great', 'good', 'bad', 'ugly', 'rough', 'hilarious', 'sarcastic', 'recent', 'equal', 'logical', 'warm', 'early', 'static', 'dynamic', 'conclusive', 'fragile', 'ripped', 'yummy', 'milky', 'strange']);
    EnglishGenerator.prototype.TRANSITIVE = EnglishGenerator.words(['fine', 'find', 'rule', 'reign', 'call', 'time', 'divide', 'list', 'join', 'replace', 'refine', 'drain', 'strain', 'show', 'display', 'hide', 'make', 'serve', 'pit', 'spin', 'slip', 'worry', 'work', 'label', 'expect', 'teach', 'confirm', 'call', 'live', 'kill', 'find', 'wrap', 'mash', 'shade', 'turn', 'time', 'love', 'hike', 'sign', 'dip', 'cross', 'design', 'craft', 'round', 'cater', 'fight', 'fold', 'pinch', 'execute', 'sense', 'trade', 'ruin', 'shake', 'advise', 'loathe', 'press', 'lift', 'conduct', 'recreate', 'conquer']);
    EnglishGenerator.prototype.VERBAS = EnglishGenerator.words(['refers to', 'defines', 'considers', 'refines', 'recalls', 'remembers', 'understands', 'knows', 'mixes', 'tips', 'cares', 'gives', 'attaches', 'accounts', 'pulls', 'deepens']);
    EnglishGenerator.prototype.VERBPAST = EnglishGenerator.words(['created', 'defined', 'eleviated', 'refined', 'abstracted', 'moded', 'preferred', 'created', 'applied', 'used', 'said', 'made', 'hoped', 'saved', 'ruled', 'fined', 'fixed', 'loved', 'bound', 'copied', 'forged', 'folded', 'dubbed', 'pointed', 'cleaned', 'shifted', 'gobbled', 'decided', 'analyzed', 'abstracted', 'snipped', 'nicked', 'stole']);
    EnglishGenerator.prototype.NOUNPLURAL = EnglishGenerator.words(['news', 'sins', 'pins', 'tins', 'ices', 'views', 'shots', 'lists', 'muses', 'colors', 'values', 'stains', 'glasses', 'courses', 'stones', 'stills', 'oxides', 'minds', 'bodies', 'cheeses', 'flavors', 'orders', 'solutions', 'mothers', 'fathers', 'spies', 'circles', 'laws', 'wars', 'homes', 'houses', 'snickers', 'shoes', 'rings', 'plastics', 'belts', 'wires', 'holes', 'parents', 'seats', 'crackers', 'ships', 'trees', 'monkeys', 'vegetables']);
    EnglishGenerator.prototype.PREPOS = EnglishGenerator.words(['over', 'above', 'below', 'under', 'behind', 'by', 'beside', 'between', 'among', 'with', 'around', 'before', 'at', 'beneath', 'after', 'of', 'off', 'on', 'outside', 'unto', 'throughout', 'toward', 'until', 'up', 'without', 'within', 'since']);
    EnglishGenerator.prototype.PRONOUN = EnglishGenerator.words(['he', 'she', 'it']);
    EnglishGenerator.prototype.PRONOUNPLURAL = EnglishGenerator.words(['I', 'we', 'they']);
    EnglishGenerator.prototype.ENTITYPLURAL = EnglishGenerator.words(['nations', 'groups', 'few', 'tides', 'times', 'divisions', 'numbers', 'lovers', 'papers', 'sticks', 'stones', 'bones']);
    EnglishGenerator.prototype.THE = EnglishGenerator.words(['the', 'our', "one's", 'his', 'her', 'their', 'my']);
    EnglishGenerator.prototype.PRESET_PREPOS_PHRASE = EnglishGenerator.words(['at the moment', 'surprisingly', 'but then again', 'after that', 'indeed', 'but before that', 'in conclusion', 'alternatively', 'in the future', 'once more', 'again', 'but then', 'though', 'right now', 'once', 'since then']);
    EnglishGenerator.prototype.ADVERB = EnglishGenerator.words(['profusely', 'slyly', 'greatly', 'badly', 'sadly', 'nicely', 'madly', 'truly', 'clearly', 'equally', 'easily', 'mainly', 'fully', 'firmly', 'exactly', 'coldly', 'surely', 'nimbly', 'happily', 'harshly', 'gently', 'grandly', 'jerkily', 'softly', 'swiftly', 'quickly', 'slowly', 'unmanly', 'eagerly', 'smartly', 'sanely']);
    EnglishGenerator.prototype.ALTHOUGH = EnglishGenerator.words(['although', 'albeit', 'once', 'though', 'even', 'while being', 'as', 'with', 'after being', 'since being']);
    EnglishGenerator.prototype.INDEED = EnglishGenerator.words(['indeed', 'really', 'very']);
    EnglishGenerator.prototype.WHAT = EnglishGenerator.words(['what', 'who', 'why', 'when', 'where', 'how']);
    EnglishGenerator.prototype.WHOWHAT = EnglishGenerator.words(['what', 'who']);
    return EnglishGenerator;
  })();
  LatinGenerator = (function() {
    __extends(LatinGenerator, Generator);
    function LatinGenerator() {
      LatinGenerator.__super__.constructor.apply(this, arguments);
    }
    LatinGenerator.prototype.SENTENCE = function() {
      var num, re;
      num = rand(4, 12);
      re = [];
      _.times(num, __bind(function() {
        re.push(this.WORD());
        if (c(15)) {
          return re.push(',');
        }
      }, this));
      if (re[re.length - 1] === ',') {
        re[re.length - 1] = ".";
      }
      return re;
    };
    LatinGenerator.prototype.paragraphs = function(count, length) {
      var paras;
      if (length == null) {
        length = null;
      }
      paras = LatinGenerator.__super__.paragraphs.call(this, count, length);
      if (paras.length) {
        paras[0] = "Lorem ipsum dolor sit amet, " + (paras[0].toLowerCase());
      }
      return paras;
    };
    LatinGenerator.prototype.WORD = LatinGenerator.randomize(function() {
      return [[1, 'SMALL_WORD'], [2, 'LONG_WORD']];
    });
    LatinGenerator.prototype.LONG_WORD = LatinGenerator.words(['accumsan', 'adipiscing', 'aliquam', 'aliquip', 'amet', 'anteposuerit', 'assum', 'augue', 'autem', 'blandit', 'claram', 'clari', 'claritas', 'claritatem', 'commodo', 'congue', 'consectetuer', 'consequat', 'consuetudium', 'decima', 'delenit', 'demonstraverunt', 'diam', 'dignissim', 'dolor', 'doming', 'duis', 'dynamicus', 'eleifend', 'elit', 'enim', 'eodem', 'eorum', 'erat', 'eros', 'esse', 'eum', 'etiam', 'euismod', 'exerci', 'facer', 'facilisi', 'facit', 'feugiat', 'fiant', 'formas', 'futurum', 'habent', 'hendrerit', 'humanitatis', 'illum', 'imperdiet', 'insitam', 'investigationes', 'ipsum', 'iriure', 'iusto', 'laoreet', 'lectores', 'lectorum', 'legentis', 'legere', 'legunt', 'liber', 'littera', 'litterarum', 'lius', 'lobortis', 'lorem', 'luptatum', 'magna', 'mazim', 'minim', 'mirum', 'modo', 'molestie', 'mutationem', 'nam', 'nibh', 'nihil', 'nisl', 'nobis', 'nostrud', 'notare', 'nulla', 'nunc', 'odio', 'parum', 'per', 'placerat', 'possim', 'praesent', 'processus', 'quam', 'quarta', 'qui', 'quinta', 'quis', 'quod', 'saepius', 'seacula', 'sed', 'sequitur', 'sit', 'sollemnes', 'soluta', 'suscipit', 'tempor', 'tincidunt', 'typi', 'ullamcorper', 'usus', 'vel', 'velit', 'veniam', 'vero', 'videntur', 'volutpat', 'vulputate', 'wisi']);
    LatinGenerator.prototype.SMALL_WORD = LatinGenerator.words(['te', 'ut', 'me', 'est', 'non', 'at', 'ad', 'cum', 'eua', 'et', 'eu', 'id', 'ii', 'in', 'ex']);
    return LatinGenerator;
  })();
  JabberwockGenerator = (function() {
    __extends(JabberwockGenerator, EnglishGenerator);
    function JabberwockGenerator() {
      JabberwockGenerator.__super__.constructor.apply(this, arguments);
    }
    JabberwockGenerator.prototype.NOUN = JabberwockGenerator.words(['mish', 'valt', 'stobe', 'secher', 'tinper', 'smicken', 'flift', 'fibben', 'wilme', 'slock', 'paust', 'braivin', 'ceape', 'trepie', 'reather', 'jilk', 'drock', 'outwice', 'lorrite', 'rime', 'chrysite', 'grannet', 'athemist', 'blage', 'content', 'acuse', 'yostfard', 'brimdone', 'pegger', 'plock', 'fean', 'blave', 'flaust', 'callay', 'gyre', 'gimble', 'wabe', 'blurb', 'snicker', 'faunt', 'quist', 'pharge']);
    JabberwockGenerator.prototype.ADJECTIVE = JabberwockGenerator.words(['first', 'second', 'selinal', 'fordal', 'scistic', 'spantial', 'blagen', 'spazzen', 'morfitt', 'vellet', 'urial', 'gushish', 'frabjous', 'vorpal', 'uffish', 'tulgey', 'galumphing', 'beamish', 'stimmish', 'glaven', 'leffish', 'bleat-like']);
    JabberwockGenerator.prototype.TRANSITIVE = JabberwockGenerator.words(['vloops', 'vexes', 'chints', 'filts', 'drings', 'cherrins', 'dequants']);
    JabberwockGenerator.prototype.VERBAS = JabberwockGenerator.words(['refers to', 'defines', 'considers', 'refints', 'recules', 'remembers', 'dersts', 'knows', 'tips', 'cares', 'gives', 'attaches', 'accouts', 'rulls', 'deepens', 'malorns', 'fordorns', 'kists', 'rims', 'ficks', 'sints', 'begates', 'adjains', 'bleens', 'rimpers', 'festions', 'lurges', 'cripes']);
    JabberwockGenerator.prototype.VERBPAST = JabberwockGenerator.words(['fopped', 'ved', 'quilled', 'glined', 'polled', 'loved', 'bound', 'morked', 'baunted', 'fauled', 'rabbed', 'baurred', 'tiqued', 'sollured', 'yammed', 'unperred', 'haured', 'haired', 'outgrabed', 'whiffled', 'blurbled', 'chortled', 'chissed', 'phodded', 'norged', 'proaned', 'haunned']);
    JabberwockGenerator.prototype.NOUNPLURAL = JabberwockGenerator.words(['mords', 'salvens', 'vulses', 'carrists', 'pontards', 'saffitons', 'ordricks', 'almies', 'shacts', 'tallicks', 'jipps', 'veeds', 'grimps', 'scafts']);
    JabberwockGenerator.prototype.ADVERB = JabberwockGenerator.words(['flaxily', 'blantily', 'astily', 'stilliny', 'trepinly', 'pightly', 'cappily', 'wapely', 'grently', 'clandly', 'buckily', 'bloftly', 'nifeetly', 'quealky', 'glowly', 'unbagly', 'veagrily', 'murtly', 'spanely', 'steeply', 'bainly']);
    return JabberwockGenerator;
  })();
  TagalogGenerator = (function() {
    __extends(TagalogGenerator, Generator);
    function TagalogGenerator() {
      TagalogGenerator.__super__.constructor.apply(this, arguments);
    }
    TagalogGenerator.prototype.SENTENCE = function() {
      return this.SENTENCE1();
    };
    TagalogGenerator.prototype.SENTENCE1 = TagalogGenerator.phrase(function() {
      return ["PREPOS_PHRASE_PRE", "ang", c(50) ? "POSSESSIVE" : void 0, c(50) ? ["ADJECTIVE_PHRASE", "NA"] : void 0, "NP", "ay", "VERBPAST", "ng", c(60) ? "POSSESSIVE" : void 0, "NP"];
    });
    TagalogGenerator.prototype.NP = TagalogGenerator.phrase(function() {
      return [c(30) ? "mga" : void 0, "NOUN", c(20) ? ["ng", "NOUN"] : void 0];
    });
    TagalogGenerator.prototype.ADJNOUN = function() {
      return '';
    };
    TagalogGenerator.prototype.PREPOS_PHRASE_PRE = TagalogGenerator.phrase(function() {
      return [c(50) ? ['PRESET_PREPOS_PHRASE', ','] : void 0];
    });
    TagalogGenerator.prototype.ADJECTIVE_PHRASE = function() {
      if (c(40)) {
        return this.ADJECTIVE_PREFIX() + this.ADJECTIVE();
      } else {
        return this.ADJECTIVE();
      }
    };
    TagalogGenerator.prototype.NOUN = TagalogGenerator.words(['pangalan', 'kaibigan', 'liwanag', 'dilim', 'habagat', 'tinik', 'ibon', 'matanda', 'reyna', 'kasama', 'kapatid', 'tauhan', 'bunso', 'lola mo', 'lupa', 'hangin', 'pamahalaan', 'pangamba', 'himala']);
    TagalogGenerator.prototype.ADJECTIVE_PREFIX = TagalogGenerator.words(["pinaka-", "napaka-", "mas-"]);
    TagalogGenerator.prototype.VERBPAST = TagalogGenerator.words(['pinili', 'ginawa', 'binago', 'dinamdam', 'itinaksil', 'binawi', 'hinatol', 'nilunod', 'tinangkilik', 'sinama', 'isinulat', 'itinakda', 'sinakay', 'ipinaalam', 'pinanaw', 'ipinalabas']);
    TagalogGenerator.prototype.ADJECTIVE = TagalogGenerator.words(['masakim', 'malumbay', 'malas', 'busilak', 'maliwanag', 'maganda', 'matipuno', 'malakas']);
    TagalogGenerator.prototype.PRESET_PREPOS_PHRASE = TagalogGenerator.words(['ngunit', 'subalit', 'datapwat', 'sabagay', 'kung ganon', 'ngayon pa man', 'ganoon pa man', 'para saatin', "para sa'yo", 'at']);
    TagalogGenerator.prototype.POSSESSIVE = TagalogGenerator.words(['aking', 'iyong', 'ating', 'kanyang']);
    TagalogGenerator.prototype.NA = TagalogGenerator.words(['na', 'mong', 'nyang']);
    return TagalogGenerator;
  })();
  ChorvaGenerator = (function() {
    __extends(ChorvaGenerator, TagalogGenerator);
    function ChorvaGenerator() {
      ChorvaGenerator.__super__.constructor.apply(this, arguments);
    }
    ChorvaGenerator.prototype.NOUN = ChorvaGenerator.words(['pangalan', 'kaibigan', 'dilim', 'tinik', 'chuvaness', 'eklat', 'eklavoo', 'chuchu', 'chuchubels', 'bubukesh', 'chenelyn', 'beki', 'mitchels', 'fez', 'itech', 'anik', 'anik-anik', 'vaklush', 'reynabels', 'mother', 'kapatid', 'kuya', 'bunso', 'Shamcey Supsup', 'jowa', 'kyota', 'keri', 'mudra', 'lulubelles', 'lokarets', 'tralala', 'hitad', 'bato', 'lupa', 'hangin', 'pamahalaan', 'pangamba', 'himala', 'tagumpay']);
    ChorvaGenerator.prototype.VERBPAST = ChorvaGenerator.words(['pinili', 'ginawa', 'binago', 'dinamdam', 'itinaksil', 'binawi', 'hinatol', 'nilunod', 'tinangkilik', 'sinama', 'isinulat', 'itinakda', 'sinakay', 'ipinaalam', 'pinanaw', 'ipinalabas', 'chinaka', 'na-Julie Yap Daza', 'chinuk-chak-cheness', 'nag-jembot-jembot', 'inokray', 'lumafang', 'umapear', 'nagpa-feel', 'nag-gorabels', 'pupuntahan', 'keri']);
    ChorvaGenerator.prototype.ADJECTIVE = ChorvaGenerator.words(['chaka', 'chipangga', 'thundercats', 'pagoda cold wave lotion', 'shubos', 'tarush', 'kyoho', 'chabaka', 'kabog', 'bongga', 'ganders', 'jutay', 'krung-krung', 'oblation', 'nakaka-lurkey', 'plastikada', 'shonga-shonga', 'Haggardo Versoza', 'Bitter Ocampo', 'Stress Drilon']);
    ChorvaGenerator.prototype.PRESET_PREPOS_PHRASE = ChorvaGenerator.words(['ayon', 'nako', 'hay nako', 'aba', 'in fairness', 'at in fairview', 'o ano', 'ditey sa balur', 'at nako, alam mo ba', 'at eto pa', 'kung ako sayo, mother']);
    ChorvaGenerator.prototype.EXCLAMATIONS = ChorvaGenerator.words(['Charing!', 'O anong sey mo?', 'Chaka!', 'Ano ba itetch?!', 'Chos!', 'Bonggang-bongga!', 'Awaaaard!', 'Win na win!']);
    ChorvaGenerator.prototype.PUNCTUATION = ChorvaGenerator.words(['.', '!']);
    ChorvaGenerator.prototype.SENTENCE = ChorvaGenerator.randomize(function() {
      return [
        [2, 'EXCLAMATIONS'], [
          5, this.phrase(function() {
            return ['SENTENCE1', 'PUNCTUATION'];
          })
        ]
      ];
    });
    return ChorvaGenerator;
  })();
  Generators = {
    english: EnglishGenerator,
    latin: LatinGenerator,
    jabberwock: JabberwockGenerator,
    tagalog: TagalogGenerator,
    chorva: ChorvaGenerator
  };
  if (typeof module !== "undefined" && module !== null) {
    module.exports = Generators;
  } else {
    this.Generators = Generators;
  }
  console.log(Generators.chorva.paragraphs(5).join("\n\n"));
}).call(this);
