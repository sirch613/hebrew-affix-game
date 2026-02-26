export const GAME_DATA = [
    // --- LEVEL 1: Basic Prefixes ---
    {
        level: 1,
        fullWord: 'הַיֶּלֶד',
        root: 'יֶּלֶד',
        affix: 'הַ',
        isPrefix: true,
        correctMeaning: 'The',
        englishWord: 'Boy',
        hint: 'The prefix הַ (Ha) works just like "The" in English! It attaches directly to the front of a noun to make it specific.',
        options: ['The', 'In / At', 'To / For', 'From']
    },
    {
        level: 1,
        fullWord: 'בַּבַּיִת',
        root: 'בַּיִת',
        affix: 'בַּ',
        isPrefix: true,
        correctMeaning: 'In / At',
        englishWord: 'House',
        hint: 'The prefix בּ (B\' or Ba) means "In", "At", or "With". It hugs the word right at the beginning to show location!',
        options: ['In / At', 'The', 'And', 'From']
    },
    {
        level: 1,
        fullWord: 'לַכֶּלֶב',
        root: 'כֶּלֶב',
        affix: 'לַ',
        isPrefix: true,
        correctMeaning: 'To / For',
        englishWord: 'Dog',
        hint: 'The prefix ל (L\' or La) means "To" or "For". Just stick it on the front of a word to point toward something!',
        options: ['To / For', 'From', 'The', 'In / At']
    },
    {
        level: 1,
        fullWord: 'מִסֵּפֶר',
        root: 'סֵּפֶר',
        affix: 'מִ',
        isPrefix: true,
        correctMeaning: 'From',
        englishWord: 'Book',
        hint: 'The prefix מִ (Mi) means "From". It\'s a tiny shortcut instead of writing the full word מן (Min).',
        options: ['From', 'The', 'And', 'To / For']
    },
    {
        level: 1,
        fullWord: 'וְשָׁלוֹם',
        root: 'שָׁלוֹם',
        affix: 'וְ',
        isPrefix: true,
        correctMeaning: 'And',
        englishWord: 'Peace',
        hint: 'The prefix וְ (V\' or U) means "And". It joins words together and is always attached to the front of the second word.',
        options: ['And', 'To / For', 'The', 'From']
    },

    // --- LEVEL 2: Pronominal Suffixes (Possession) ---
    {
        level: 2,
        fullWord: 'סִפְרִי',
        root: 'סִפְר',
        affix: 'ִי',
        isPrefix: false,
        correctMeaning: 'My',
        englishWord: 'Book',
        hint: 'The suffix ִי (-ee) means "My". Add it to the end of a noun to claim it as your own!',
        options: ['My', 'Your (masc)', 'His', 'Our']
    },
    {
        level: 2,
        fullWord: 'כַּלְבְּךָ',
        root: 'כַּלְבְּ',
        affix: 'ךָ',
        isPrefix: false,
        correctMeaning: 'Your (masc)',
        englishWord: 'Dog',
        hint: 'The suffix ךָ (-kha) means "Your" when talking to a boy or a man. It tags onto the end of a noun.',
        options: ['Your (masc)', 'My', 'His', 'Her']
    },
    {
        level: 2,
        fullWord: 'חֲתוּלוֹ',
        root: 'חֲתוּל',
        affix: 'וֹ',
        isPrefix: false,
        correctMeaning: 'His',
        englishWord: 'Cat',
        hint: 'The suffix וֹ (-o) means "His". Hook it to the end of a noun to show that it belongs to him!',
        options: ['His', 'Our', 'My', 'Your (masc)']
    },
    {
        level: 2,
        fullWord: 'בֵּיתֵנוּ',
        root: 'בֵּיתֵ',
        affix: 'נוּ',
        isPrefix: false,
        correctMeaning: 'Our',
        englishWord: 'House',
        hint: 'The suffix נוּ (-nu) means "Our". We put it at the end of a word when something belongs to all of us.',
        options: ['Our', 'Her', 'My', 'Your (masc)']
    },
    {
        level: 2,
        fullWord: 'אִמָּהּ',
        root: 'אִמָּ',
        affix: 'הּ',
        isPrefix: false,
        correctMeaning: 'Her',
        englishWord: 'Mother',
        hint: 'The suffix הּ (-ah) means "Her". Attach it to the end of a word to show that it belongs to her!',
        options: ['Her', 'His', 'My', 'Our']
    },

    // --- LEVEL 3: Verbal Affixes (Past & Future Tense) ---
    {
        level: 3,
        fullWord: 'הָלַכְתִּי',
        root: 'הָלַכְ',
        affix: 'תִּי',
        isPrefix: false,
        correctMeaning: 'I (Past)',
        englishWord: 'Walk',
        hint: 'The suffix תִּי (-ti) is placed at the end of a verb to magically trap it in the past, meaning "I did it".',
        options: ['I (Past)', 'You (Future)', 'He (Future)', 'We (Past)']
    },
    {
        level: 3,
        fullWord: 'תֵּלֵךְ',
        root: 'לֵךְ',
        affix: 'תֵּ',
        isPrefix: true,
        correctMeaning: 'You / She (Future)',
        englishWord: 'Walk',
        hint: 'The prefix ת (T) jumps on the front of a verb to talk about the future, meaning "You will" or "She will".',
        options: ['You / She (Future)', 'I (Past)', 'He (Future)', 'We (Future)']
    },
    {
        level: 3,
        fullWord: 'יֵלֵךְ',
        root: 'לֵךְ',
        affix: 'יֵ',
        isPrefix: true,
        correctMeaning: 'He (Future)',
        englishWord: 'Walk',
        hint: 'The prefix י (Y) launches a verb into the future—specifically for a guy! It means "He will".',
        options: ['He (Future)', 'I (Past)', 'We (Future)', 'You (Past)']
    },
    {
        level: 3,
        fullWord: 'נֵלֵךְ',
        root: 'לֵךְ',
        affix: 'נֵ',
        isPrefix: true,
        correctMeaning: 'We (Future)',
        englishWord: 'Walk',
        hint: 'The prefix נ (N) is a team player! At the front of a verb, it points to the future and means "We will".',
        options: ['We (Future)', 'He (Future)', 'I (Past)', 'They (Future)']
    },
    {
        level: 3,
        fullWord: 'אָכַלְנוּ',
        root: 'אָכַלְ',
        affix: 'נוּ',
        isPrefix: false,
        correctMeaning: 'We (Past)',
        englishWord: 'Eat',
        hint: 'The suffix נוּ (-nu) grabs a verb and pulls it into the past for a group. It means "We did it"!',
        options: ['We (Past)', 'I (Past)', 'They (Past)', 'He (Future)']
    }
];
