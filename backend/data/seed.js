const { writeDB } = require('../db');

const books = [
  { id: 1, title: 'Pride and Prejudice', author: 'Jane Austen', year: 1813, pages: 432, category: 'Fiction', tier: 'library', price: 0, oldPrice: null,
    desc: 'A sharp, witty novel of manners following Elizabeth Bennet as she navigates courtship, class, and first impressions in Regency England.',
    authorBio: 'Jane Austen (1775–1817) was an English novelist known for romantic fiction critiquing the British landed gentry.',
    cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&q=60&auto=format&fit=crop' },
  { id: 2, title: 'Meditations', author: 'Marcus Aurelius', year: 180, pages: 256, category: 'Philosophy', tier: 'library', price: 0, oldPrice: null,
    desc: 'Private reflections of the Roman emperor on duty, mortality, and self-discipline.',
    authorBio: 'Marcus Aurelius (121–180 AD) was Roman emperor and a leading Stoic philosopher.',
    cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&q=60&auto=format&fit=crop' },
  { id: 3, title: 'Attention Is Not All You Need', author: 'Open Access Journal', year: 2024, pages: 18, category: 'Research', tier: 'catalog', price: 0, oldPrice: null,
    desc: 'An open-access paper examining the limitations of transformer attention mechanisms in long-context reasoning tasks.',
    authorBio: 'Published collaboratively by an open research collective under a CC-BY license.',
    cover: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500&q=60&auto=format&fit=crop' },
  { id: 4, title: 'The Coastline Notebooks', author: 'M. Alaric', year: 2023, pages: 284, category: 'Fiction', tier: 'catalog', price: 6, oldPrice: null,
    desc: "A quiet, original novel following three siblings returning to their late father's coastal house.",
    authorBio: 'M. Alaric is an independent author publishing directly through OpenBook Store under a licensing agreement.',
    cover: 'https://images.unsplash.com/photo-1512045482977-9db72d6b0aa5?w=500&q=60&auto=format&fit=crop' },
  { id: 5, title: 'Frankenstein', author: 'Mary Shelley', year: 1818, pages: 280, category: 'Fiction', tier: 'library', price: 0, oldPrice: null,
    desc: 'A scientist creates life, then abandons it — the foundational novel of science fiction.',
    authorBio: 'Mary Shelley (1797–1851) was an English novelist, best known for this, written when she was 18.',
    cover: 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=500&q=60&auto=format&fit=crop' },
  { id: 6, title: 'Deep Work Principles', author: 'Research Collective', year: 2022, pages: 212, category: 'Business', tier: 'offer', price: 9, oldPrice: 15,
    desc: 'A practical framework for sustained, distraction-free focus in knowledge work.',
    authorBio: 'Compiled by an independent research and publishing collective.',
    cover: 'https://images.unsplash.com/photo-1553729784-e91953dec042?w=500&q=60&auto=format&fit=crop' },
  { id: 7, title: 'On the Nature of Things', author: 'Lucretius', year: -50, pages: 270, category: 'Philosophy', tier: 'offer', price: 3, oldPrice: 8,
    desc: 'A sweeping Epicurean poem explaining the physical universe, the soul, and how to live without fear of death.',
    authorBio: 'Titus Lucretius Carus was a Roman poet and philosopher of the 1st century BC.',
    cover: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=500&q=60&auto=format&fit=crop' },
  { id: 8, title: 'Modern Research Methods', author: 'Open Access Journal', year: 2023, pages: 44, category: 'Research', tier: 'offer', price: 4, oldPrice: 10,
    desc: 'A concise open-access guide to contemporary quantitative and qualitative research methodology.',
    authorBio: 'Published under open-access terms by an academic journal collective.',
    cover: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&q=60&auto=format&fit=crop' },
];

writeDB({ books, users: [], orders: [], messages: [] });
console.log(`Seeded ${books.length} books into data/db.json`);
