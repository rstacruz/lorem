//
//
// Text Generator
//
//

function efloor(a,b)
    { return (a<b)?a:b; }

function erandom(pMin,pMax)
	{ return Math.round(Math.random() * (pMax-pMin)) + pMin; }
	
//
//
// Words class
//
//

function Words(p_words)
{
	this.words = p_words;
	this.randBuffer = new Array();
	this.m_randOffs = -1;
	
	
	this.m_bufferPush = function(p)
	{
		// Pop the last element if it's too much
		this.m_randOffs++;
		
		if (this.m_randOffs > efloor(22, this.words.length -1) -1)
			this.m_randOffs = 0;

		// Add as the first element
		this.randBuffer[this.m_randOffs] = p;
	
	}
	
	this.get = function()
	{
		// Sorted Random Buffer
		var srb = this.randBuffer;
		srb.sort(  function(a,b) {return a-b;}  );
		
		var f;
		
		// TODO: improvement of random (buffering)
		f = erandom(0,p_words.length-1 - srb.length);
		
		var fOrig = f;
		for (var i in srb)
			{ if (srb[i] <= f) f++; }
			
		this.m_bufferPush(f);
		return p_words[f];
	}
}


//
//
//
// class TextGenerator
//
// The abstract class that each language will inherit.
// (e.g., EnglishTextGenerator is a subclass of TextGenerator.)
//
// Each subclass of this will define words, phrases, and sentences.
// Words are word lists (instance of class Words), phrases are groups of word
// types, and sentences are groups of phrases and words.
//
//


function TextGenerator()
{
//  ------
//  Fields
	this.sentences = new Array();
	this.phrases   = new Array();
	this.words     = new Array();
	
	
//  ------
//  wordJoin()
//! Joins an array of words into a space-separated phrase. (private method)
//
	function wordJoin(p_sentence)
    {
		var f = '', t;
		
		for (var i in p_sentence)
        {
			// Take each element in p_sentence.
			t = p_sentence[i];
			
			// Work it if it's an array. (recursive style)
			// (This makes sure t is string)
			if (t.constructor == Array) { t = wordJoin(t); }
			
			// Decide wether it's to be prepadded with a space or not.
			if (t != '') {
				if ((t.substr(0,1) == ',') ||
					(t.substr(0,1) == '?') ||
					(t.substr(0,1) == '.'))
				          { f = (f?f:'')     + t; }
				else { f = (f?f+' ':'') + t; }
			}
		}
		return f;
	}
	
	
//  ------	
//! Capitalizes the first character and punctuates a certain string.
//  (private method)
//	 
	function sentenceCase(pSentence)
    {
        // Make it into a string if it's an array
		if (pSentence.constructor == Array) { pSentence = wordJoin(pSentence); }
		
		// Yay
		var f = pSentence.charAt(0).toUpperCase() + pSentence.substr(1);
		if (f.length == 0) return '';
		
		if ((f.substr(f.length-1) != '?') &&
		    (f.substr(f.length-1) != '!') &&
		    (f.substr(f.length-1) != '.'))
			{ f = f + '.'; }
		return f;
	}
	
	
//  ------
//! Generates a random sentence.
//  Picks a random sentence pattern, generates, and sentence-case-ifies it.
//
	this.getSentence = function(pOptions)
	{
		return sentenceCase( this.sentences[erandom(0,this.sentences.length -1)]() );
	}
	
	
//  ------
//! Generates a series of sentences. (via getSentence())
//
	this.getParagraph = function(p_length)
	{
		// p_length = 0.01;
		// Don't quit 'till we reach a certain length.
		var f = '', e = erandom(220 * p_length, 350 * p_length);
		while (f.length < e)
			{ f = (f?f+' ':'') + this.getSentence(); }
			
		return f + '\n\n';
	}
	

//  ------
//! Generates a series of paragraphs. (via getParagraph())
//
	this.generate = function(p_opts)
	{
		for (var f,i=0; i<p_opts["paraCount"]; ++i)
			f = (f?f:'') + this.getParagraph(p_opts["len"]);
		return f.substr(0,f.length-2);
	}

	
//  ------
//  Returns a phrase or word.
//  tg.get('noun') returns a random 'noun.' (either word or phrase)
//
	this.get = function(p)
	{
		// If the phrase exists, return it
		if (t.phrases[p])  { return t.phrases[p](); }
		
		// Else return it from the word list
		else  { return t.words[p].get(); }
	}
	
	this.an = function(p)
	{
		// return p;
		// One in 4 chances
		switch (erandom(1,3)) 
		{
		  case 1:
		    return p;
		  case 2:
		  
			if (p.constructor == Array) { return [get('the'), wordJoin(p)]; }
			else { return get('the') + ' ' + p; }
		    
		  case 3:
			var vowels = 'AaEeIiOoUu';
			
			var word;
			if (p.constructor == Array) { word = wordJoin(p); }
			else { word = p; }
			
			var pre = ((vowels.indexOf(word.substr(0,1)) != -1) ? 'an':'a');
			if (p.constructor == Array) { return [pre, wordJoin(p)]; }
			else { return pre + ' ' + p; }
		}
	}
//  ------
//  Ctor?
//
	t = this;
	get = this.get;
	an = this.an;
}




///////////////////////////////////////////////////////////////////////////////
//
//
// class EnglishGenerator (subclass of TextGenerator)
// Grammar set for english.
//
//

			
function EnglishGenerator()
{	

	this.superclass = TextGenerator;
	this.superclass();
	
	
	// ------------------------------------------------------------------------
	// Word list
	
	this.words = {		
		noun: new Words ([
			
			'depth', 'sense', 'touch', 'farce', 'sight', 'vision', 'height',
			'balance', 'pitch', 'scion', 'might', 'store', 'funk', 'worm',
			'coffee', 'bean', 'ice', 'salad', 'finger', 'chicken',
            
            'dog', 'cat', 'mouse', 'trunk', 'pond', 'chain', 'liquid',
            'shift', 'fiber', 'dilemma', 'clock', 'past',
            'rain', 'cap', 'key', 'string', 'bill', 'rod', 'outline', 'hour',
            'period', 'time', 'number', 'section', 'state', 'page', 'content',
            'surface', 'work', 'comment', 'acuse', 'support', 'postcard', 'sheet', 'paper',
            'phone', 'mail', 'gravy', 'sauce', 'gas', 'insect', 'claw',
            'powder', 'plastic', 'seed', 'leaf', 'bridge', 'home', 'flake',
            'art', 'pail', 'crown', 'elephant', 'sky', 'vodka', 'gin', 'tonic',
            'grin', 'smile',
            'valley', 'nobody', 'threat', 'boss', 'employee',
            'heart', 'head',
            
            'fingernail', 'aquarium', 'forest', 'science', 'accessory'
			]),

  		adjective: new Words ([
		  	'conventional', 'sequential', 'not quite', 'chocolate', 'hazardous',
		  	
		  	'deviant', 'leather', 'ambient', 'biblical', 'general', 'crescent',
		  	'new', 'low', 'new', 
		  	'blue', 'thin', 'warm', 'high', 'late', 'rich', 'ripe',
		  	'sharp', 'tight', 'focal', 'scant', 'silly',
		  	'vetted', 'rotten', 'shiny', 'dull', 'lucky', 'solid', 'fine',
		  	'cold', 'hot', 'dizzy', 'dark', 'sick',
              
            'nice', 'great', 'good', 'bad', 'ugly', 'rough', 'hilarious',
            'sarcastic',
            'recent', 'equal', 'logical', 'warm', 'early', 'static', 'dynamic',
            'conclusive', 'fragile', 'ripped', 'yummy', 'milky', 'strange',
  		]),

  		verbTransitive: new Words ([
			'fines', 'finds', 'rules', 'reigns', 'calls', 'times', 'divides',
			'lists', 'joins', 'replaces', 'refines', 'drains', 'strains',
            'shows', 'displays', 'hides', 'makes', 'serves',
            'pits', 'spins', 'slips', 'worries', 'works', 'labels', 'expects',
            'teaches', 'confirms', 'calls', 'lives', 'kills', 'finds', 'wraps', 
            'mashes', 'shades', 'turns', 'times', 'loves', 'hikes', 'signs',
            'dips', 'crosses', 'designs', 'crafts', 'rounds', 'caters',
            'fights', 'folds', 'pinches', 'executes', 'senses', 'trades', 'ruins',
            'shakes', 'advises', 'loathes', 'presses', 'lifts', 'conducts',
            'recreates',
		]),

        // Verb that goes in "____ (noun) as (noun)"
        // Preceded by a noun that's singular
		verbAs: new Words ([
			'refers to', 'defines', 'considers', 'refines', 'recalls', 'remembers',
			'understands', 'knows', 'mixes', 'tips', 'cares', 'gives', 'attaches',
			'accounts', 'pulls', 'deepens'
			
			/* need more! */
		]),
		
		verbPast: new Words ([
			'created', 'defined', 'eleviated', 'refined', 'abstracted', 'moded',
			'preferred', 'created', 'applied',
            
            'used', 'fell', 'said', 'made',
            'hoped', 'saved', 'ruled', 'fined', 'fixed', 'loved', 'bound',
            'copied', 'forged', 'folded', 'dubbed',
            'pointed', 'cleaned', 'shifted', 'gobbled', 'decided',
            'analyzed', 'abstracted', 'snipped', 'nicked', 'stole'
		]),
		
		nounPlural: new Words ([
			//'premises', 'disabilities', 'constructs', 'salutations', 'reasons',
			//'downfalls', 'apologies', 'vectors',
			//'fabrications', 'publications', 'grievances',
			
			'news', 'sins', 'pins', 'tins', 'ices',
			'views', 'shots', 'lists', 'muses',
			'colors', 'values', 'stains',
			'glasses', 'courses', 
			'stones', 'stills', 'oxides',
			'minds', 'bodies', 'cheeses', 'flavors', 'orders',
			'solutions', 'mothers', 'fathers', 'spies', 'circles', 'laws', 'wars', 'homes',
			'houses', 'snickers', 'shoes', 'rings', 'plastics', 'belts',
			'wires', 'holes', 'parents', 'seats', 'crackers', 'ships', 'trees',
			'monkeys', 'vegetables'
		]),

		prepos: new Words ([
			'over', 'above', 'below', 'under', 'behind', 'by', 'beside',
            'between', 'among', 'with', 'around', 'before', 'at', 'beneath',
            'after', 'of', 'off', 'on', 'outside', 'unto', 'throughout',
            'toward', 'until', 'up', 'without', 'within', 'since'
		]),
		
		pronounPlural: new Words ([
			'I', 'we', 'they',
		]),
		
		entityPlural: new Words ([
			'nations', 'groups', 'few', 'tides', 'times', 'divisions',
			'numbers', 'lovers', 'papers', 'sticks', 'stones', 'bones'
			/* need more! */
		]),
		
		the: new Words ([
            'the', 'our', "one's", 'his', 'her', 'their', 'my'
        ]),
		
		presetPreposPhrase: new Words ([
			'at the moment', 'surprisingly', 'but then again',
			'after that', 'indeed', 'but before that', 'in conclusion',
			'alternatively', 'in the future', 'once more', 'again',
			'but then', 'though', 'right now', 'once', 'since then'
		]),
		
		adverb: new Words ([
			'profusely', 'slyly', 'greatly', 'badly', 'sadly', 'nicely',
			'madly', 'truly', 'clearly', 'equally', 'easily', 'mainly',
			'fully', 'firmly', 'exactly', 'coldly', 'surely', 'nimbly',
			'happily', 'harshly', 'gently', 'grandly', 'jerkily', 'softly',
			'swiftly', 'quickly', 'slowly', 'unmanly', 'eagerly', 'smartly',
			'sanely'
		]),
		
		although: new Words ([
			'although', 'albeit', 'once', 'though', 'even', 'while being',
			'as', 'with', 'after being', 'since being'
		]),
		
		as: new Words ([
			'as', 'with', 'on', 'by'
		]),
		
		// Pahabol
		indeed: new Words ([
			'indeed', 'really', 'very',
		]),
		
		what: new Words ([
			'what', 'who', 'why', 'when', 'where', 'how'
		])
	};
	
	
	// ------------------------------------------------------------------------
	// Grammar rules
	
	// TODO: knowing of sentence length in sentence/phrase functions
	// TODO: adjNoun: { function(), function() }
	
	this.phrases = {
		adjNoun: function() {
			return [erandom(0,2) !=0?'': get('adjective'), get('noun')
				];
		},
		
		preposPhrase: function() {
			return [get('prepos'), get('nounPlural')
				];
		},
		
		subjectPlural: function() {
			return erandom(0,1)!=0?
				[get('pronounPlural')] :
				["the", get('entityPlural')]
				;
		},
		
		num: function() {
			return erandom(0,10)==0 ? (String(erandom(10,50))) : '';
		},
		
		preposPhrasePre: function() {
			var ran = erandom(0,6);
			if (ran <= 1)
				return '';
			if (ran <= 2)
				{ return [get('presetPreposPhrase'), ',']; }
			if (ran <= 4)
				{ return [get('adverb'), ',']; }
			if (ran <= 5)
				{ return [get('adverb'), get('verbPast'), ',']; }
			else
				{ return ''; } //[get('although'), ","]; }
		},
		
		post: function() {
			var ran = erandom(0,5);
			if (ran <= 1)
				{ return [',', get('indeed'), get('adjective')]; }
			else if (ran <= 2)
				{ return [(erandom(0,1)==0?',':''), get('indeed')]; }
			else if (ran <= 3)
				{ return [(erandom(0,2)==0?',':''), get('adverb')]; }
			return '';
		},
		
		the_: function() {
			return erandom(0,1)!=0? get('the') : [get('the'),get('noun')+"'s"];
		}
	};
	
	
	// ------------------------------------------------------------------------
	// Grammar rules
	
	this.sentences = [
		function() {
			return [get('preposPhrasePre'), an(get('adjNoun')),
				(erandom(0,1)!=0? ["of", get('noun')]:''), get('verbTransitive'),
				erandom(0,1)!=0?
					[get('the'), get('noun')] :
					[get('noun'), get('prepos'), get('noun')]
				];
		},
		
		function() {
			return [get('preposPhrasePre'), an(get('adjNoun')), get('verbAs'),
				get('the'), get('adjNoun'),
				erandom(0,1)!=0?'': 
					["of", (erandom(0,1)!=0?'': get('adjective')), get('nounPlural')],
				get('preposPhrase'),
				(erandom(0,1)==0? [get('prepos'), get('nounPlural')] : '')
			  ];
		},
		
		function() {
			return [get('the_'), get('noun'), get('verbPast'), get('the_'),
			(erandom(0,1)==0 ? get('adjective') : ''),
			get('noun'),
				(erandom(0,4)==0 ? (get('adverb')) : ''), get('post') ];
		},
		
		// Question
		function() {
			switch (erandom(0,1)) {
				case 0: return [get('preposPhrasePre'), 'why', '?'];
				case 1: return [
					(erandom(0,2)==0?'but':''),
					(erandom(0,1)==0?'who':'what'),
					get('verbPast'), (erandom(0,1)==0?[get('the_'), get('adjNoun')]:''), 

'?'];
				default: return '';
			}
		}
		
	];
}


function JabberwockGenerator()
{	

	this.superclass = EnglishGenerator;
	this.superclass();
	
	
	// ------------------------------------------------------------------------
	// Word list
	
	this.words = {		
		noun: new Words ([
			
			'mish', 'valt', 'stobe', 'secher', 'tinper', 'smicken',
			'flift', 'fibben', 'wilme', 'slock', 'paust',
			'braivin', 'ceape', 'trepie', 'reather', 'jilk', 'drock', 'outwice',
			'lorrite', 'rime', 'chrysite', 'grannet', 'athemist', 'blage', 'content',
			'acuse', 'yostfard', 'brimdone', 'pegger', 'plock', 'fean', 'blave', 'flaust',
			'callay', 'gyre', 'gimble', 'wabe', 'blurb', 'snicker', 'faunt', 'quist',
			'pharge', 
			]),

  		adjective: new Words ([
		  	'first', 'second', 'selinal', 'fordal', 'scistic', 'spantial', 'blagen',
		  	'spazzen', 'morfitt', 'vellet', 'urial', 'gushish', 'frabjous', 'vorpal',
			'uffish', 'tulgey', 'galumphing', 'beamish', 'stimmish', 'glaven', 'leffish',
			'bleat-like'
  		]),

  		verbTransitive: new Words ([
			'vloops', 'vexes', 'chints', 'filts', 'drings', 'cherrins', 'dequants'
		]),

        // Verb that goes in "____ (noun) as (noun)"
        // Preceded by a noun that's singular
		verbAs: new Words ([
			'refers to', 'defines', 'considers', 'refints', 'recules', 'remembers',
			'dersts', 'knows', 'tips', 'cares', 'gives', 'attaches',
			'accouts', 'rulls', 'deepens', 'malorns', 'fordorns', 'kists', 'rims',
			'ficks', 'sints', 'begates', 'adjains', 'bleens', 'rimpers', 'festions',
			'lurges', 'cripes'
			/* need more! */
		]),
		
		verbPast: new Words ([
			'fopped', 'ved', 'quilled', 'glined', 'polled', 'loved', 'bound',
			'morked', 'baunted', 'fauled', 'rabbed', 'baurred', 'tiqued',
			'sollured', 'yammed', 'unperred', 'haured', 'haired', 'outgrabed',
			'whiffled', 'blurbled', 'chortled', 'chissed', 'phodded', 'norged',
			'proaned', 'haunned'
		]),
		
		nounPlural: new Words ([
			'mords', 'salvens', 'vulses', 'carrists', 'pontards', 'saffitons',
			'ordricks', 'almies', 'shacts', 'tallicks', 'jipps', 'veeds',
			'grimps', 'scafts'
		]),

		prepos: new Words ([
			'over', 'above', 'below', 'under', 'behind', 'by', 'beside',
	            'between', 'among', 'with', 'around', 'before', 'at', 'beneath',
	            'after', 'of', 'off', 'on', 'outside', 'unto', 'throughout',
	            'toward', 'until', 'up', 'without', 'within', 'since'
		]),
		
		pronounPlural: new Words ([
			'I', 'we', 'they',
		]),
		
		the: new Words ([
            'the', 'our', "one's", 'his', 'her', 'their', 'my'
        ]),
		
		presetPreposPhrase: new Words ([
			'at the moment', 'surprisingly', 'but then again',
			'after that', 'indeed', 'but before that', 'in conclusion',
			'alternatively', 'in the future', 'once more', 'again',
			'but then', 'though', 'right now', 'once', 'since then'
		]),
		
		adverb: new Words ([
			'flaxily', 'blantily', 'astily', 'stilliny', 'trepinly',
			'pightly',
			
			'cappily', 'wapely', 'grently', 'clandly', 'buckily', 'bloftly',
			'nifeetly', 'quealky', 'glowly', 'unbagly', 'veagrily', 'murtly',
			'spanely', 'steeply', 'bainly'
		]),
		
		although: new Words ([
			'although', 'albeit', 'once', 'though', 'even', 'while being',
			'as', 'with', 'after being', 'since being'
		]),
		
		as: new Words ([
			'as', 'with', 'on', 'by'
		]),
		
		// Pahabol
		indeed: new Words ([
			'indeed', 'really', 'very',
		]),
		
		what: new Words ([
			'what', 'who', 'why', 'when', 'where', 'how'
		])
	};
	
}

///////////////////////////////////////////////////////////////////////////////
//
//
// Class LatinGenerator (subclass of TextGenerator)
// Word and grammar set for latin-ish.
//
//


function LatinGenerator()
{	

	this.superclass = TextGenerator;
	this.superclass();
	
	
	// ------------------------------------------------------------------------
	// Word list
	
	this.words = {
		latin: new Words ([
			'accumsan', 'adipiscing', 'aliquam', 'aliquip', 'amet', 
			'anteposuerit', 'assum', 'augue', 'autem', 'blandit', 'claram', 
			'clari', 'claritas', 'claritatem', 'commodo', 'congue', 
			'consectetuer', 'consequat', 'consuetudium', 'decima', 'delenit', 
			'demonstraverunt', 'diam', 'dignissim', 'dolor', 'doming', 'duis', 
			'dynamicus', 'eleifend', 'elit', 'enim', 'eodem', 'eorum', 'erat', 
			'eros', 'esse', 'eum', 'etiam', 'euismod', 'exerci', 'facer', 
			'facilisi', 'facit', 'feugiat', 'fiant', 'formas', 'futurum', 
			'habent', 'hendrerit', 'humanitatis', 'illum', 'imperdiet', 
			'insitam', 'investigationes', 'ipsum', 'iriure', 'iusto', 'laoreet', 
			'lectores', 'lectorum', 'legentis', 'legere', 'legunt', 'liber', 
			'littera', 'litterarum', 'lius', 'lobortis', 'lorem', 'luptatum', 
			'magna', 'mazim', 'minim', 'mirum', 'modo', 'molestie', 
			'mutationem', 'nam', 'nibh', 'nihil', 'nisl', 'nobis', 'nostrud', 
			'notare', 'nulla', 'nunc', 'odio', 'parum', 'per', 'placerat', 
			'possim', 'praesent', 'processus', 'quam', 'quarta', 'qui', 
			'quinta', 'quis', 'quod', 'saepius', 'seacula', 'sed', 'sequitur', 
			'sit', 'sollemnes', 'soluta', 'suscipit',	'tempor', 'tincidunt', 
			'typi', 'ullamcorper', 'usus', 'vel', 'velit', 'veniam', 'vero', 
			'videntur', 'volutpat', 'vulputate', 'wisi'
  		]),
  		
  		small: new Words ([
  			'te', 'ut', 'me', 'est', 'non', 'at', 'ad', 'cum', 'eua', 'et', 'eu',
  			'id', 'ii', 'in', 'ex'
  		])
	};
	
	
	// ------------------------------------------------------------------------
	// Grammar rules
	
	this.sentences = [
		function()
		{
		    // No grammar rules here; simply pick out random words out of the
		    // bag; intersperse between small and long words.
		    
			for (var end=erandom(4,12),f=new Array(),i=0; i<end; ++i)
            {
				// 1 in 3 chances to get a small word
				if (erandom(1,3) <= 1)  { f[f.length] = get('small'); }
				else					{ f[f.length] = get('latin'); }
					
				// 1 in 7 chances to add a punctuation, but only if we're not
				// on the last word
				if ((erandom(1,6) <= 1) && (i != end-1))
					{ f[f.length] = ','; }
			}
			
			return f;
		}
	];
	
	this.generate = function(p_opts)
	{
		for (var f,i=0; i<p_opts["paraCount"]; ++i)
			f = (f?f:'') + this.getParagraph(p_opts["len"]);
		f = f.substr(0,f.length-2);
		f = f.substr(0,1).toLowerCase() + f.substr(1,f.length);
		return 'Lorem ipsum dolor sit amet,\x20' + f;
	}
}





///////////////////////////////////////////////////////////////////////////////
//
//
// Class TagalogGenerator (subclass of TextGenerator)
// Grammar set for tagalog.
//
//

			
function TagalogGenerator()
{	

	this.superclass = TextGenerator;
	this.superclass();
	
	
	// ------------------------------------------------------------------------
	// Word list
	
	this.words = {		
		noun: new Words ([
			'pangalan', 'kaibigan', 'liwanag',  'dilim', 'habagat', 'tinik'
			]),
			
		verbPast: new Words ([
			'pinili', 'ginawa', 'binago', 'dinamdam', 'itinaksil', 'binawi',
			'hinatol', 'nilunod', 'tinangkilik', 'sinama', 'isinulat',
			'itinakda', 'sinakay', 'ipinaalam', 'pinanaw', 'ipinalabas',
			]),
			
		entity: new Words ([
			// living
			'ibon', 'matanda', 'reyna', 'kasama', 'kapatid',
			'tauhan', 'bunso', 'lola mo',
			
			// non-living
			'lupa', 'hangin', 'pamahalaan',
			'pangamba', 'himala'
			]),
			
		adjective: new Words ([
			'masakim', 'malumbay', 'malas', 'busilak', 'maliwanag',
			'maganda', 'matipuno', 'malakas', 'winner', 'pranella', 'jubis'
			]),
			
		presetPreposPhrase: new Words ([
			'ngunit', 'subalit', 'datapwat', 'sabagay', 'kung ganon',
			'ngayon pa man', 'ganoon pa man', 'para saatin', "para sa'yo", 'at'
			]),
			
		possessive: new Words ([
			'aking', 'iyong', 'ating', 'kanyang'
			]),

    na: new Words ([
      'na', 'mong', 'nyang'
      ])
	};
		// todo 'sampakan ng liwanag' (without "ma" prefix in the adjective)
	
	
	// ------------------------------------------------------------------------
	// Grammar rules
	
	// TODO: knowing of sentence length in sentence/phrase functions
	// TODO: adjNoun: { function(), function() }
	
	this.phrases = {
		adjNoun: function() {
			return '';
		},
		
		preposPhrasePre: function() {
			var ran = erandom(0,4);
			if (ran <= 1)
				return [get('presetPreposPhrase'), ','];
			else return '';
		},
		
		adjModPh: function() {
			var ran = erandom(0,4);
			if (ran <= 3)
				return 'pinaka-';
			else return '';
		}
	};
	
	
	// ------------------------------------------------------------------------
	// Grammar rules
	
	this.sentences = [
	
		// past tense sentences
		function() {
			return [get('preposPhrasePre'), "ang",
				
				erandom(0,3)<=1?'':get('possessive'),
				erandom(0,1)==0?'':[get('adjModPh')+ get('adjective'), get('na')], get('noun'),
				
				"ng", get('entity'), "ay", get('verbPast'), "ng",
				
				erandom(0,2)<=1?'':get('possessive'),
				
				// randomize plurality ("mga")
				erandom(0,1)==0?'':
					[ erandom(0,2)<=1?'':"mga",
					  get('adjModPh')+ get('adjective'), get('na')
					],
				get('entity')
				];
		}
		// ang pagpili ng bato sa lupa ay hindi ganito-ganon
	];
}

function ChorvaGenerator()
{	

	this.superclass = TagalogGenerator;
	this.superclass();

	this.words = {		
		noun: new Words ([
			'pangalan', 'kaibigan', 'liwanag',  'dilim', 'habagat', 'tinik',
      'chuvaness', 'eklat', 'eklavoo', 'chuchu', 'chuchubels', 'bubukesh',
      'chenelyn', 'beki', 'mitchels', 'fez', 'itech', 'anik', 'anik-anik',
      'vaklush'
			]),
			
    // Not necessarily past tense, but past tense works best
		verbPast: new Words ([
			'pinili', 'ginawa', 'binago', 'dinamdam', 'itinaksil', 'binawi',
			'hinatol', 'nilunod', 'tinangkilik', 'sinama', 'isinulat',
			'itinakda', 'sinakay', 'ipinaalam', 'pinanaw', 'ipinalabas',
      'chinaka', 'na-Julie Yap Daza', 'chinuk-chak-cheness',
      'nag-jembot-jembot', 'inokray', 'lumafang', 'umapear',
      'nagpa-feel', 'nag-gorabels', 'pupuntahan', 'keri'
			]),
			
		entity: new Words ([
			// living
			'ibon', 'reynabels', 'mother', 'kapatid', 'kuya',
			'tauhan', 'bunso', 'panganay', 'Shamcey Supsup', 'jowa',
      'kyota', 'keri', 'mudra', 'lulubelles', 'lokarets',
      'tralala', 'hitad',
			
			// non-living
			'bato', 'lupa', 'hangin', 'pamahalaan',
			
			// abstract nouns
			'pangamba', 'himala', 'tagumpay'
			]),
			
		adjective: new Words ([
      'chaka', 'chipangga', 'thundercats', 'pagoda cold wave lotion',
      'shubos', 'tarush', 'kyoho', 'chabaka', 'kabog', 'bongga',
      'ganders', 'jutay', 'krung-krung', 'oblation', 'nakaka-lurkey',
      'plastikada', 'shonga-shonga', 'Haggardo Versoza'
			]),
			
		presetPreposPhrase: new Words ([
			'ayon', 'nako', 'hay nako', 'aba',
      'in fairness', 'at in fairview', 'o ano', 'ditey sa balur',
      'at nako, alam mo ba', 'at eto pa', 'kung ako sayo, mother'
			]),
			
    exclamations: new Words ([
      'Charing!', 'O anong sey mo?', 'Chaka!', 'Ano ba itetch?!', 'Chos!',
      'Bonggang-bongga!', 'Awaaaard!', 'Win na win!'
      ]),

		possessive: new Words ([
			'aking', 'iyong', 'ating', 'kanyang'
			]),

    na: new Words ([
      'na', 'mong', 'nyang'
      ])
	};


  var oldSentences = this.sentences[0];
  this.sentences = [ function() {
      if (erandom(0,2)==0)
        { return get('exclamations'); }
      else
        { return oldSentences(); }
  } ];

  this.oldGetSentence = this.getSentence;
	this.getSentence = function(pOptions)
	{
		var s = this.oldGetSentence(pOptions);
    var p = s.substr(s.length -1);

    if (p == '.') {
      s = s.substr(0, s.length - 1);
      s += (erandom(0,1) == 0) ? '!' : '.';
    }

    return s;
	}
}


///////////////////////////////////////////////////////////////////////////////
//
//
// Hooks
//
//

function $(p) { return document.getElementById(p); }
function toggleDisplay(p)
    { p.style.display = (p.style.display == 'none') ? ('') : ('none'); }

function btnGenerate_onClick()
{
	var f, gen;
	switch ($('optGen').value)
	{
	  case 'latin':		  gen = new LatinGenerator();    break;
	  case 'tagalog':   gen = new TagalogGenerator();  break;
	  case 'jabberwock':gen = new JabberwockGenerator();  break;
	  case 'chorva':    gen = new ChorvaGenerator();  break;
	  default:   		    gen = new EnglishGenerator();  break;
	}

  // Change the permalink
  if ($('optGen').value == 'latin')
    { window.location.hash = ''; }
  else
    { window.location.hash = '#' + $('optGen').value; }

  document.body.className = $('optGen').value;

	f = gen.generate({
		paraCount:  $('optParaCount').value,
		len: 		$('optLen').value
      });
		
	// A little work around for the double spacing thing. No clue what's
    // causing it
	$('textOut').value = f.replace(/\ \ /g,' ');
}

window.onload = function()
{
	$('btnGenerate')   .onclick    = btnGenerate_onClick;
	$('optParaCount')  .onchange   = btnGenerate_onClick;
	$('optLen')        .onchange   = btnGenerate_onClick;
	$('optGen')        .onchange   = btnGenerate_onClick;
	
	$('optSelect').onclick = function()
    {
		$('textOut').select();
		$('textOut').focus();
	}
	
  if (window.location.hash) {
    $('optGen').value = window.location.hash.substr(1);
    btnGenerate_onClick();
  }

	$('optShowtags').onclick = function()
    {
		// If it's already got <p> then forget it
		if ($('textOut').value.indexOf('<p>') != -1)
		{
			$('textOut').value =
                $('textOut').value.replace(/<p>|<\/p>/g,'');
		}
		else
		{
			$('textOut').value =
			    $('textOut').value
				    .replace(/^/,'<p>')
				    .replace(/$/,'</p>')
				    .replace(/(\r|\n)+(?!\$)/mg,'</p>\n\n<p>');
		}
	}
	
	btnGenerate_onClick();
}
