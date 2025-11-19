// inspiration.js - Daily Scripture Verses and Inspirational Quotes for GOD Project

class InspirationManager {
    constructor() {
        this.verses = [
            "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future. - Jeremiah 29:11",
            "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go. - Joshua 1:9",
            "Trust in the Lord with all your heart and lean not on your own understanding. - Proverbs 3:5",
            "The Lord is my shepherd, I lack nothing. - Psalm 23:1",
            "I can do all things through Christ who strengthens me. - Philippians 4:13",
            "Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid. - John 14:27",
            "Love the Lord your God with all your heart and with all your soul and with all your mind. - Matthew 22:37",
            "The Lord is close to the brokenhearted and saves those who are crushed in spirit. - Psalm 34:18",
            "Cast all your anxiety on him because he cares for you. - 1 Peter 5:7",
            "Let the peace of Christ rule in your hearts, since as members of one body you were called to peace. - Colossians 3:15"
        ];

        this.quotes = [
            "The best way to find yourself is to lose yourself in the service of others. - Mahatma Gandhi",
            "The only way to do great work is to love what you do. - Steve Jobs",
            "Believe you can and you're halfway there. - Theodore Roosevelt",
            "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
            "You miss 100% of the shots you don't take. - Wayne Gretzky",
            "The only impossible journey is the one you never begin. - Tony Robbins",
            "Your time is limited, so don't waste it living someone else's life. - Steve Jobs",
            "The best revenge is massive success. - Frank Sinatra",
            "The mind is everything. What you think you become. - Buddha",
            "The secret of getting ahead is getting started. - Mark Twain"
        ];

        this.currentVerseIndex = 0;
        this.currentQuoteIndex = 0;
    }

    initialize() {
        this.loadFromStorage();
        this.displayCurrentInspiration();
        this.setupEventListeners();
    }

    loadFromStorage() {
        const savedVerseIndex = localStorage.getItem('currentVerseIndex');
        const savedQuoteIndex = localStorage.getItem('currentQuoteIndex');
        const lastUpdate = localStorage.getItem('lastInspirationUpdate');

        const today = new Date().toDateString();
        if (lastUpdate !== today) {
            // New day, get new random inspiration
            this.currentVerseIndex = Math.floor(Math.random() * this.verses.length);
            this.currentQuoteIndex = Math.floor(Math.random() * this.quotes.length);
            localStorage.setItem('currentVerseIndex', this.currentVerseIndex);
            localStorage.setItem('currentQuoteIndex', this.currentQuoteIndex);
            localStorage.setItem('lastInspirationUpdate', today);
        } else {
            this.currentVerseIndex = savedVerseIndex ? parseInt(savedVerseIndex) : 0;
            this.currentQuoteIndex = savedQuoteIndex ? parseInt(savedQuoteIndex) : 0;
        }
    }

    displayCurrentInspiration() {
        const verseElement = document.getElementById('dailyVerse');
        const quoteElement = document.getElementById('dailyQuote');

        if (verseElement) {
            verseElement.textContent = this.verses[this.currentVerseIndex];
        }

        if (quoteElement) {
            quoteElement.textContent = this.quotes[this.currentQuoteIndex];
        }
    }

    getNewVerse() {
        this.currentVerseIndex = (this.currentVerseIndex + 1) % this.verses.length;
        localStorage.setItem('currentVerseIndex', this.currentVerseIndex);
        this.displayCurrentInspiration();
        addMessage('New verse received. May it guide your day.', 'god');
    }

    getNewQuote() {
        this.currentQuoteIndex = (this.currentQuoteIndex + 1) % this.quotes.length;
        localStorage.setItem('currentQuoteIndex', this.currentQuoteIndex);
        this.displayCurrentInspiration();
        addMessage('New inspiration received. Let it uplift your spirit.', 'god');
    }

    setupEventListeners() {
        const newVerseBtn = document.getElementById('newVerse');
        const newQuoteBtn = document.getElementById('newQuote');

        if (newVerseBtn) {
            newVerseBtn.addEventListener('click', () => this.getNewVerse());
        }

        if (newQuoteBtn) {
            newQuoteBtn.addEventListener('click', () => this.getNewQuote());
        }
    }

    getRandomVerse() {
        return this.verses[Math.floor(Math.random() * this.verses.length)];
    }

    getRandomQuote() {
        return this.quotes[Math.floor(Math.random() * this.quotes.length)];
    }
}

// Global instance
const inspirationManager = new InspirationManager();
