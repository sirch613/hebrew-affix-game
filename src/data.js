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
        options: ['We (Past)', 'I (Past)', 'They (Past)', 'He (Future)']
    }
];
