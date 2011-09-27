# # Text generator
# This is the text generator that powers http://ricostacruz.com/lorem.

_ = @_ or require 'underscore'

# ----------------------------------------------------------------------------

# ## Sham
# A little shim to ensure that random picks are not repeated. This is used for
# the `r()` helper.
#
#     sham = new Sham
#     arr = ['a', 'b', 'c', 'd', 'e', 'f']
#
#     _.times 5, -> console.log sham.pick arr
#
#     #=> 'e', 'd', 'b', 'a', 'c'
#     #   (notice that there are no repeating items)

class Sham
  cache: []
  max:   5
  pick: (arr) ->
    tries = 0

    str = pick arr
    while @cache.indexOf(str) != -1 and tries < (@max*2)
      tries += 1
      str = pick arr

    @cache.unshift str
    @cache = @cache.slice(0, @max)  if @cache.length > @max
    str

# ----------------------------------------------------------------------------

# ## Helpers
# These are the little private functions that are used all around.

# ### rand()
# Returns a random number from `min` to `max`.
#
#     rand(1, 4)
#     #=> can be 1, 2, 3, or 4
#
rand = (min, max) ->
  Math.round(Math.random() * (max-min)) + min

# ### pick()
# Returns a random element from the given array.
#
#     pick ['a', 'b', 'c']
#     #=> Can be 'a', 'b' or 'c'
#
pick = (arr) ->
  arr[rand 0, arr.length-1]

# ### c(chances, max)
# Returns true `chances` out of `max` times.
#
#     c 40     # true 40% of the time
#     c 1, 3   # true 33% of the time
#
c = (chances, max=100) ->
  Math.random() < (chances * 1.0 / max)

# ### r()
# Returns a random element from the given array. Tries to minimize occurances
# of duplicate words.
#
cache = new Sham
r = (arr) -> cache.pick arr

# ### join(array)
# Joins a list of words together, taking punctuation into account.
#
#     join ['hello', ',', 'goodbye']
#     #=> "hello, goodbye"
#
join = (array) ->
  _.inject _.flatten(array), (str, word) ->
    if word.match punctuation
      "#{str}#{word}"
    else
      "#{str} #{word}"

# ### punctuation
# Regex to match for punctuations.
punctuation = /^[,\?!\."]+$/

# ### sentencize(array)
# Joins a list of words into a sentence, taking case and punctuation into account.
#
#     s = sentence ['hello', 'Jacob']
#     s()
#     #=> 'Hello Jacob.'
#
sentencize = (array) ->
  array = [array]  unless array.constructor == Array

  str = periodize capitalize join array

  if str.length > 0
    str += "."  unless str[str.length-1].match punctuation

  str

# ### periodize(str)
# Adds a period to the end of a string. Doesn't affect strings that are already
# punctuated.
#
#     periodize "Hello!"
#     periodize "Bye"
#
#     #=> "Hello!", "Bye."
#
periodize = (str) ->
  if str.length > 0 and not str[str.length-1].match punctuation
    str + "."
  else
    str

# ### capitalize(str)
# 
#     capitalize "i'm here on IRC"
#     #=> "I'm here on IRC"
#
capitalize = (str) ->
  if str.length > 0
    str[0].toUpperCase() + str.substr(1)
  else
    str

# ### pluralize(str)
#
#     pluralize "worry"
#     pluralize "teach"
#
#     #=> "worries"
#     #=> "teaches"
#
pluralize = (str) ->
  return str  if str.length == 0

  if str.substr(str.length-1) == 'y'
    "#{str.substr(0, str.length-1)}ies" # worry => worries

  else if ['sh', 'ch', 'th'].indexOf(str.substr(str.length-2)) > -1
    "#{str.substr(0, str.length-2)}es" # teach => teaches

  else
    "#{str}s" # Ends in vowel or consonant

# ----------------------------------------------------------------------------

# ## Generator
# The parent class of all generators.
#
# Each generator is made up of elements.  An element is any method that returns
# an array of words, or a string phrase.
#
# Elements are often built from the generators (`@phrase`, `@word`,
# `@randomize`).  However, any function that will return an array or string
# will be sufficient.
#
# Elements typically use other elements, which use other elements, and so
# on.
#
class Generator
  # ### SENTENCE()
  # Grammar for a sentence. This is the main element.
  SENTENCE: -> ''

  # ### sentence()
  # Generates a sentence.
  sentence: ->
    sentencize @SENTENCE()

  # ### paragraph(length)
  # Generates a paragraph with the given minimum character `length`.
  paragraph: (length=200) ->
    str   = ''
    tries = 0

    while str.length < length && tries < length
      str += ' ' if str.length > 0 and str[str.length-1] isnt ' '
      str += @sentence()

    str

  # ### paragraphs(count, length)
  # Generates `count` paragraphs. Returns an array of strings.
  paragraphs: (count, length=null) ->
    output = []
    _.times count, => output.push @paragraph length

    output

  # ### use(what)
  # Uses `what`.
  #
  # When `what` is a:
  #
  #  * Function: runs it and uses it again.
  #  * String, element name: uses that element.
  #  * Else: as is.
  #
  use: (what, self=this) ->
    if typeof what == 'function'
      @use (what.apply self), self
    else if self[what]
      @use self[what](), self
    else
      what

# ----------------------------------------------------------------------------

# ## Builders
# These are function generators that are class methods of the class
# `Generator`. These are often used to build elements.
#
# They can be invoked in the class definition like so:
#
#     class MyGenerator extends Generator
#       FOO: @phrase ...
#
# In this case, the `@` (this) refers to `MyGenerator` (notice it's not
# inside a method function definition).

# ### phrase(grammar)
# Returns a function that builds a phrase from a given `grammar`.  The
# `grammar` is a list of either words, or elements, or functions.
#
#     p = Generator.phrase ['hello', 'NAME']
#     p()
#     #=> "hello Jerrick"
#
Generator.phrase = (args) ->
  list = if typeof args == 'function' then args() else args
  list = _.flatten list
  -> _.compact _.flatten _.map list, (element) => @use(element)

# ### words(array)
# Returns a function that picks a random word from the given `array`.
#
#     w = Generator.words ['Jenna', 'Jason', 'Jacob']
#     w()
#     #=> "Jason"
#
Generator.words = (array) ->
  -> r array

# ### randomize(mapfunc)
# Chooses a random element based on a given element/chance map.
#
# `mapfunc` is a function that must return an array of [`chances`,
# `definition`] tuples.
#
#     randomize -> [
#       [1, 'SENTENCE1']
#       [4, 'SENTENCE2']
#     ]
#     
#     # 1 out of 5 chances that it returns SENTENCE1
#     # 4 out of 5 chances that it returns SENTENCE2
#
Generator.randomize = (f) ->
  chances = f.apply this
  max = _.inject chances, ((a, [chance, element]) -> a + chance), 0

  ->
    i     = rand 1, max
    stack = 0

    for n of chances
      [chance, element] = chances[n]
      stack += chance

      return @use(element, this)  if i <= stack

# ### Delegations
# This makes `EnglishGenerator.paragraph()` an alias for `(new
# EnglishGenerator()).paragraph()`.
#
methods = [
  'paragraphs'
  'paragraph'
  'sentence'
]

_.each methods, (meth) ->
  Generator[meth] = (args...) ->
    generator = new this
    generator[meth].apply generator, args

# ----------------------------------------------------------------------------

# ## EnglishGenerator
# This is the sillyness generator!
#
class EnglishGenerator extends Generator

  # ### SENTENCE
  # Redefine the main sentence element.
  SENTENCE: @randomize -> [
    [1, "QUESTION"]
    [1, "SENTENCE1"]
    [1, "SENTENCE2"]
    [1, "SENTENCE3"]
    [1, "SENTENCE4"]
  ]

  # ### SENTENCE1
  # A sentence with a transitive verb.
  #
  #     A crown shades his touch.
  #     Once more, a shift slips their section.
  #
  SENTENCE1: @phrase -> [
    'PREPOSPHRASEPRE', 'NP',
    ['of', 'ARTICLE' if c(30), 'NOUN'] if c(50),
    'TRANSITIVE_S',
    if c(50) then ['THE', 'NOUN'] else ['NOUN', 'PREPOS', 'NOUN']
  ]

  # ### SENTENCE2
  # A sentence.
  # 
  #     Surprisingly, a flake refines her forest of milky stills
  #     toward pins with wars.
  #
  #     Once, a bean mixes our postcards of dark parents until
  #     cheeses at fathers.
  #
  SENTENCE2: @phrase -> [
    'PREPOSPHRASEPRE', 'AN_ADJNOUN', 'VERBAS', 'THE', 'ADJNOUN',
    ['of', 'ADJECTIVE' if c(50), 'NOUNPLURAL'] if c(50),
    'PREPOSPHRASE',
    ['PREPOS', 'THE', 'PLACE'] if c(50)
  ]

  # ### SENTENCE3
  # A sentence.
  #
  #     One's bill snipped our period's rain, really bad.
  #
  SENTENCE3: @phrase -> [
    'ARTICLE', 'NOUN', 'VERBPAST', 'ARTICLE',
    'ADJECTIVE' if c(50), 'NOUN', 'ADVERB' if c(25), 'POST'
  ]

  # ### SENTENCE4
  # A quote.
  #
  #     "Drag his sister's strobe!" she exclaimed behind our school.
  #
  SENTENCE4: @phrase -> [
    'QUOTE', "ENTITY", "ADVERB" if c(20), "VERBPAST",
    ['PREPOS', 'THE', 'PLACE'] if c(10)
  ]

  QUOTE: ->
    punc = r ['!', ',', ',']
    "\"#{capitalize join @SAYING()}#{punc}\""

  SAYING: @randomize -> [
    [1, @phrase -> ["TRANSITIVE", "ARTICLE", "NP"]]
  ]

  # ### QUESTION
  # A question.
  #
  #     "Then again, why?"
  #     "But who applied her leaf's sky?"
  #
  QUESTION: @randomize -> [
    [1, @phrase -> ["PREPOSPHRASEPRE", "WHAT", "?"]]
    [2, @phrase -> ["but" if c(50), "WHOWHAT", "VERBPAST", ["ARTICLE", "NP"] if c(60), "?"]]
  ]

  # ### NP
  # Noun phrase.
  #
  #     dull pail of kittens
  #     snail
  #     static smile
  #
  NP: @randomize -> [
    [1, @phrase -> ['ADJECTIVE' if c(25), 'NOUN']]
  ]

  # ### ENTITY
  # Nouns that can say things.
  ENTITY: @randomize -> [
    [1, "PRONOUN"]
    [1, @phrase -> ['ARTICLE', 'POSESSIVE' if c(25), 'ADJECTIVE' if c(25), 'NOUN']]
  ]

  # ### PREPOSPHRASEPRE
  # What gets prepended to a sentence.
  PREPOSPHRASEPRE: @randomize -> [
    [3, '']
    [1, @phrase -> ["PRESET_PREPOS_PHRASE", ","]]
    [2, @phrase -> ["ADVERB", ","]]
    [1, @phrase -> ["ADVERB", "VERBPAST", ","]]
  ]

  # ### POST
  # What gets appended to a sentence at random.
  POST: @randomize -> [
    [3, '']
    [2, @phrase -> [",", "INDEED", "ADJECTIVE"]]
    [1, @phrase -> ["," if c(50), "INDEED"]]
    [1, @phrase -> ["," if c(50), "ADVERB"]]
  ]

  AN_ADJNOUN: ->
    str = join @ADJNOUN()
    if ['a', 'e', 'i', 'o', 'u'].indexOf(str[0]) > -1
      "an #{str}"
    else
      "a #{str}"

  POSESSIVE: ->
    "#{@NOUN()}'s"

  ARTICLE: @randomize -> [
    [1, @phrase -> ["THE"]],
    [1, @phrase -> ["THE", "POSESSIVE"]]
  ]

  ADJNOUN: @phrase ->
    ["ADJECTIVE" if c(33), "NOUN"]

  PREPOSPHRASE: @phrase ->
    ["PREPOS", "NOUNPLURAL"]

  SUBJECTPLURAL: @randomize -> [
    [1, @phrase -> ['PRONOUNPLURAL']]
    [1, @phrase -> ['the', 'ENTITYPLURAL']]
  ]

  TRANSITIVE_S: ->
    pluralize @TRANSITIVE()

  # ### Basic words
  # These are some basic nouns, verbs and adjectives.
  NOUN: @words [
    'depth', 'sense', 'touch', 'farce', 'sight', 'vision', 'height', 'balance',
    'pitch', 'scion', 'might', 'store', 'funk', 'worm', 'coffee', 'bean',
    'ice', 'salad', 'finger', 'chicken', 'dog', 'cat', 'mouse', 'trunk',
    'pond', 'chain', 'liquid', 'shift', 'fiber', 'dilemma', 'clock', 'past',
    'rain', 'cap', 'key', 'string', 'bill', 'rod', 'outline', 'hour', 'period',
    'time', 'number', 'section', 'state', 'page', 'content', 'surface', 'work',
    'comment', 'acuse', 'support', 'postcard', 'sheet', 'paper', 'phone',
    'mail', 'gravy', 'sauce', 'gas', 'insect', 'claw', 'powder', 'plastic',
    'seed', 'leaf', 'bridge', 'home', 'flake', 'art', 'pail', 'crown',
    'elephant', 'sky', 'vodka', 'gin', 'tonic', 'grin', 'smile', 'valley',
    'threat', 'boss', 'employee', 'heart', 'head', 'fingernail',
    'aquarium', 'forest', 'science', 'accessory'
  ]

  PLACE: @words [
    'kitchen', 'hall', 'school', 'zoo', 'local library', 'camp'
  ]

  ADJECTIVE: @words [
    'conventional', 'sequential', 'not quite', 'chocolate', 'hazardous',
    'deviant', 'leather', 'ambient', 'biblical', 'general', 'crescent', 'new',
    'low', 'new', 'blue', 'thin', 'warm', 'high', 'late', 'rich', 'ripe',
    'sharp', 'tight', 'focal', 'scant', 'silly', 'vetted', 'rotten', 'shiny',
    'dull', 'lucky', 'solid', 'fine', 'cold', 'hot', 'dizzy', 'dark', 'sick',
    'nice', 'great', 'good', 'bad', 'ugly', 'rough', 'hilarious', 'sarcastic',
    'recent', 'equal', 'logical', 'warm', 'early', 'static', 'dynamic',
    'conclusive', 'fragile', 'ripped', 'yummy', 'milky', 'strange'
  ]

  TRANSITIVE: @words [
    'fine', 'find', 'rule', 'reign', 'call', 'time', 'divide', 'list',
    'join', 'replace', 'refine', 'drain', 'strain', 'show', 'display',
    'hide', 'make', 'serve', 'pit', 'spin', 'slip', 'worry', 'work',
    'label', 'expect', 'teach', 'confirm', 'call', 'live', 'kill',
    'find', 'wrap', 'mash', 'shade', 'turn', 'time', 'love', 'hike',
    'sign', 'dip', 'cross', 'design', 'craft', 'round', 'cater',
    'fight', 'fold', 'pinch', 'execute', 'sense', 'trade', 'ruin',
    'shake', 'advise', 'loathe', 'press', 'lift', 'conduct',
    'recreate', 'conquer'
  ]

  # ### VERBAS
  # Verb that goes in `____ (noun) as (noun)`.  Often preceded by a noun
  # that's singular.
  VERBAS: @words [
    'refers to', 'defines', 'considers', 'refines', 'recalls', 'remembers',
    'understands', 'knows', 'mixes', 'tips', 'cares', 'gives', 'attaches',
    'accounts', 'pulls', 'deepens'
  ]

  VERBPAST: @words [
    'created', 'defined', 'eleviated', 'refined', 'abstracted', 'moded',
    'preferred', 'created', 'applied', 'used', 'said', 'made', 'hoped',
    'saved', 'ruled', 'fined', 'fixed', 'loved', 'bound', 'copied', 'forged',
    'folded', 'dubbed', 'pointed', 'cleaned', 'shifted', 'gobbled', 'decided',
    'analyzed', 'abstracted', 'snipped', 'nicked', 'stole'
  ]

  NOUNPLURAL: @words [
    'news', 'sins', 'pins', 'tins', 'ices', 'views', 'shots', 'lists', 'muses',
    'colors', 'values', 'stains', 'glasses', 'courses', 'stones', 'stills',
    'oxides', 'minds', 'bodies', 'cheeses', 'flavors', 'orders', 'solutions',
    'mothers', 'fathers', 'spies', 'circles', 'laws', 'wars', 'homes',
    'houses', 'snickers', 'shoes', 'rings', 'plastics', 'belts', 'wires',
    'holes', 'parents', 'seats', 'crackers', 'ships', 'trees', 'monkeys',
    'vegetables'
  ]

  PREPOS: @words [
    'over', 'above', 'below', 'under', 'behind', 'by', 'beside', 'between',
    'among', 'with', 'around', 'before', 'at', 'beneath', 'after', 'of', 'off',
    'on', 'outside', 'unto', 'throughout', 'toward', 'until', 'up', 'without',
    'within', 'since'
  ]

  PRONOUN: @words [
    'he', 'she', 'it'
  ]

  PRONOUNPLURAL: @words [
    'I', 'we', 'they'
  ]

  ENTITYPLURAL: @words [
    'nations', 'groups', 'few', 'tides', 'times', 'divisions',
    'numbers', 'lovers', 'papers', 'sticks', 'stones', 'bones'
  ]

  THE: @words [
    'the', 'our', "one's", 'his', 'her', 'their', 'my'
  ]

  PRESET_PREPOS_PHRASE: @words [
    'at the moment', 'surprisingly', 'but then again', 'after that', 'indeed',
    'but before that', 'in conclusion', 'alternatively', 'in the future',
    'once more', 'again', 'but then', 'though', 'right now', 'once', 'since then'
  ]

  ADVERB: @words [
    'profusely', 'slyly', 'greatly', 'badly', 'sadly', 'nicely', 'madly',
    'truly', 'clearly', 'equally', 'easily', 'mainly', 'fully', 'firmly',
    'exactly', 'coldly', 'surely', 'nimbly', 'happily', 'harshly', 'gently',
    'grandly', 'jerkily', 'softly', 'swiftly', 'quickly', 'slowly', 'unmanly',
    'eagerly', 'smartly', 'sanely'
  ]

  ALTHOUGH: @words [
    'although', 'albeit', 'once', 'though', 'even', 'while being', 'as',
    'with', 'after being', 'since being'
  ]

  INDEED: @words [
    'indeed', 'really', 'very'
  ]

  WHAT: @words [
    'what', 'who', 'why', 'when', 'where', 'how'
  ]

  WHOWHAT: @words [
    'what', 'who'
  ]

# ----------------------------------------------------------------------------

# ## LatinGenerator
# Makes faux lorem ipsum.
#
class LatinGenerator extends Generator
  # ### SENTENCE
  # No grammar rules here, just pick out random words and intersperse between
  # long and short ones.
  #
  # Also, add a comma every now and then, and ensure that the last character
  # is not a comma.
  #
  SENTENCE: ->
    num = rand 4, 12

    re  = []
    _.times num, =>
      re.push @WORD()
      re.push ','  if c(15)

    re[re.length-1] = "."  if re[re.length-1] is ','
    re

  # ### paragraphs()
  # Override `paragraphs` to ensure that the first paragraph
  # begins with lorem ipsum.
  paragraphs: (count, length=null) ->
    paras = super count, length
    paras[0] = "Lorem ipsum dolor sit amet, #{paras[0].toLowerCase()}"  if paras.length
    paras

  # ### Words
  # Separate the long from the short words.
  WORD: @randomize -> [
    [1, 'SMALL_WORD']
    [2, 'LONG_WORD']
  ]

  LONG_WORD: @words [
    'accumsan', 'adipiscing', 'aliquam', 'aliquip', 'amet', 'anteposuerit',
    'assum', 'augue', 'autem', 'blandit', 'claram', 'clari', 'claritas',
    'claritatem', 'commodo', 'congue', 'consectetuer', 'consequat',
    'consuetudium', 'decima', 'delenit', 'demonstraverunt', 'diam',
    'dignissim', 'dolor', 'doming', 'duis', 'dynamicus', 'eleifend', 'elit',
    'enim', 'eodem', 'eorum', 'erat', 'eros', 'esse', 'eum', 'etiam',
    'euismod', 'exerci', 'facer', 'facilisi', 'facit', 'feugiat', 'fiant',
    'formas', 'futurum', 'habent', 'hendrerit', 'humanitatis', 'illum',
    'imperdiet', 'insitam', 'investigationes', 'ipsum', 'iriure', 'iusto',
    'laoreet', 'lectores', 'lectorum', 'legentis', 'legere', 'legunt', 'liber',
    'littera', 'litterarum', 'lius', 'lobortis', 'lorem', 'luptatum', 'magna',
    'mazim', 'minim', 'mirum', 'modo', 'molestie', 'mutationem', 'nam', 'nibh',
    'nihil', 'nisl', 'nobis', 'nostrud', 'notare', 'nulla', 'nunc', 'odio',
    'parum', 'per', 'placerat', 'possim', 'praesent', 'processus', 'quam',
    'quarta', 'qui', 'quinta', 'quis', 'quod', 'saepius', 'seacula', 'sed',
    'sequitur', 'sit', 'sollemnes', 'soluta', 'suscipit',  'tempor',
    'tincidunt', 'typi', 'ullamcorper', 'usus', 'vel', 'velit', 'veniam',
    'vero', 'videntur', 'volutpat', 'vulputate', 'wisi'
  ]

  SMALL_WORD: @words [
    'te', 'ut', 'me', 'est', 'non', 'at', 'ad', 'cum', 'eua', 'et', 'eu', 'id',
    'ii', 'in', 'ex'
  ]

# ----------------------------------------------------------------------------

# ## JabberwockGenerator
# Makes random text based on Jabberwockian non-sense. It reuses the English
# grammar rules and just redefines the word list.
#
class JabberwockGenerator extends EnglishGenerator
  NOUN: @words [
    'mish', 'valt', 'stobe', 'secher', 'tinper', 'smicken', 'flift', 'fibben',
    'wilme', 'slock', 'paust', 'braivin', 'ceape', 'trepie', 'reather', 'jilk',
    'drock', 'outwice', 'lorrite', 'rime', 'chrysite', 'grannet', 'athemist',
    'blage', 'content', 'acuse', 'yostfard', 'brimdone', 'pegger', 'plock',
    'fean', 'blave', 'flaust', 'callay', 'gyre', 'gimble', 'wabe', 'blurb',
    'snicker', 'faunt', 'quist', 'pharge'
  ]

  ADJECTIVE: @words [
    'first', 'second', 'selinal', 'fordal', 'scistic', 'spantial', 'blagen',
    'spazzen', 'morfitt', 'vellet', 'urial', 'gushish', 'frabjous', 'vorpal',
    'uffish', 'tulgey', 'galumphing', 'beamish', 'stimmish', 'glaven',
    'leffish', 'bleat-like'
  ]

  TRANSITIVE: @words [
    'vloops', 'vexes', 'chints', 'filts', 'drings', 'cherrins', 'dequants'
  ]

  VERBAS: @words [
    'refers to', 'defines', 'considers', 'refints', 'recules', 'remembers',
    'dersts', 'knows', 'tips', 'cares', 'gives', 'attaches', 'accouts',
    'rulls', 'deepens', 'malorns', 'fordorns', 'kists', 'rims', 'ficks',
    'sints', 'begates', 'adjains', 'bleens', 'rimpers', 'festions', 'lurges',
    'cripes'
  ]

  VERBPAST: @words [
    'fopped', 'ved', 'quilled', 'glined', 'polled', 'loved', 'bound', 'morked',
    'baunted', 'fauled', 'rabbed', 'baurred', 'tiqued', 'sollured', 'yammed',
    'unperred', 'haured', 'haired', 'outgrabed', 'whiffled', 'blurbled',
    'chortled', 'chissed', 'phodded', 'norged', 'proaned', 'haunned'
  ]

  NOUNPLURAL: @words [
    'mords', 'salvens', 'vulses', 'carrists', 'pontards', 'saffitons',
    'ordricks', 'almies', 'shacts', 'tallicks', 'jipps', 'veeds', 'grimps',
    'scafts'
  ]

  ADVERB: @words [
    'flaxily', 'blantily', 'astily', 'stilliny', 'trepinly', 'pightly',
    'cappily', 'wapely', 'grently', 'clandly', 'buckily', 'bloftly',
    'nifeetly', 'quealky', 'glowly', 'unbagly', 'veagrily', 'murtly',
    'spanely', 'steeply', 'bainly'
  ]

# ----------------------------------------------------------------------------

# ## TagalogGenerator
# Generates garbage in Tagalog/Filipino.
class TagalogGenerator extends Generator
  SENTENCE: ->
    @SENTENCE1()

  SENTENCE1: @phrase -> [
    "PREPOS_PHRASE_PRE", "ang",
    "POSSESSIVE" if c(50),
    ["ADJECTIVE_PHRASE", "NA"] if c(50),
    "NP"
    "ay"
    "VERBPAST"
    "ng"
    "POSSESSIVE" if c(60)
    "NP"
  ]

  NP: @phrase -> [
    "mga" if c(30),
    "NOUN",
    ["ng", "NOUN"] if c(20)
  ]

  ADJNOUN: -> ''

  PREPOS_PHRASE_PRE: @phrase -> [
    [ 'PRESET_PREPOS_PHRASE', ',' ] if c(50)
  ]

  ADJECTIVE_PHRASE: ->
    if c(40)
      @ADJECTIVE_PREFIX() + @ADJECTIVE()
    else
      @ADJECTIVE()

  # ### Basic words
  NOUN: @words [
    'pangalan', 'kaibigan', 'liwanag',  'dilim', 'habagat', 'tinik'
    'ibon', 'matanda', 'reyna', 'kasama', 'kapatid', 'tauhan', 'bunso',
    'lola mo', 'lupa', 'hangin', 'pamahalaan', 'pangamba', 'himala'
  ]

  ADJECTIVE_PREFIX: @words [
    "pinaka-", "napaka-", "mas-"
  ]

  VERBPAST: @words [
    'pinili', 'ginawa', 'binago', 'dinamdam', 'itinaksil', 'binawi', 'hinatol',
    'nilunod', 'tinangkilik', 'sinama', 'isinulat', 'itinakda', 'sinakay',
    'ipinaalam', 'pinanaw', 'ipinalabas',
  ]

  ADJECTIVE: @words [
    'masakim', 'malumbay', 'malas', 'busilak', 'maliwanag',
    'maganda', 'matipuno', 'malakas'
  ]

  PRESET_PREPOS_PHRASE: @words [
    'ngunit', 'subalit', 'datapwat', 'sabagay', 'kung ganon',
    'ngayon pa man', 'ganoon pa man', 'para saatin', "para sa'yo", 'at'
  ]

  POSSESSIVE: @words [
    'aking', 'iyong', 'ating', 'kanyang'
  ]

  NA: @words [
    'na', 'mong', 'nyang'
  ]

# ----------------------------------------------------------------------------

# ## ChorvaGenerator
# A sociolect of Tagalog implemented for the lulz.
#
# Just like the `JabberwockGenerator`, this works by extending a generator
# with grammar rules (Tagalog in this case) and merely replacing words.
#
class ChorvaGenerator extends TagalogGenerator
  NOUN: @words [
    'pangalan', 'kaibigan', 'dilim', 'tinik', 'chuvaness', 'eklat', 'eklavoo',
    'chuchu', 'chuchubels', 'bubukesh', 'chenelyn', 'beki', 'mitchels', 'fez',
    'itech', 'anik', 'anik-anik', 'vaklush', 'reynabels', 'mother', 'kapatid',
    'kuya', 'bunso', 'Shamcey Supsup', 'jowa', 'kyota', 'keri', 'mudra',
    'lulubelles', 'lokarets', 'tralala', 'hitad', 'bato', 'lupa', 'hangin',
    'pamahalaan', 'pangamba', 'himala', 'tagumpay'
  ]
    
  # ### VERBPAST
  # Not necessarily past tense, but past tense verbs work best.
  VERBPAST: @words [
    'pinili', 'ginawa', 'binago', 'dinamdam', 'itinaksil', 'binawi',
    'hinatol', 'nilunod', 'tinangkilik', 'sinama', 'isinulat',
    'itinakda', 'sinakay', 'ipinaalam', 'pinanaw', 'ipinalabas',
    'chinaka', 'na-Julie Yap Daza', 'chinuk-chak-cheness',
    'nag-jembot-jembot', 'inokray', 'lumafang', 'umapear',
    'nagpa-feel', 'nag-gorabels', 'pupuntahan', 'keri'
  ]
    
  ADJECTIVE: @words [
    'chaka', 'chipangga', 'thundercats', 'pagoda cold wave lotion',
    'shubos', 'tarush', 'kyoho', 'chabaka', 'kabog', 'bongga',
    'ganders', 'jutay', 'krung-krung', 'oblation', 'nakaka-lurkey',
    'plastikada', 'shonga-shonga', 'Haggardo Versoza'
  ]
    
  PRESET_PREPOS_PHRASE: @words [
    'ayon', 'nako', 'hay nako', 'aba',
    'in fairness', 'at in fairview', 'o ano', 'ditey sa balur',
    'at nako, alam mo ba', 'at eto pa', 'kung ako sayo, mother'
  ]
    
  EXCLAMATIONS: @words [
    'Charing!', 'O anong sey mo?', 'Chaka!', 'Ano ba itetch?!', 'Chos!',
    'Bonggang-bongga!', 'Awaaaard!', 'Win na win!'
  ]

  PUNCTUATION: @words [
    '.', '!'
  ]

  SENTENCE: @randomize -> [
    [1, 'EXCLAMATIONS']
    [1, @phrase -> ['SENTENCE1', 'PUNCTUATION']]
  ]

# ----------------------------------------------------------------------------

# ## Exports
# Export the generators to NodeJS's `module` object, or the browser's
# `window` object.

Generators =
  english:    EnglishGenerator
  latin:      LatinGenerator
  jabberwock: JabberwockGenerator
  tagalog:    TagalogGenerator
  chorva:     ChorvaGenerator

if module?
  module.exports = Generators
else
  @Generators = Generators

console.log Generators.chorva.paragraphs(5).join("\n\n")
